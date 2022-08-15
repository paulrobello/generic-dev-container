#!/usr/bin/env bash
# make sure windows git bash does not alter paths
export MSYS_NO_PATHCONV=1
# gets folder where this script actually lives, resolving symlinks if needed
# this folder is the docker root for building the container
SCRIPT_DIR="$(cd -- "$(dirname -- "$(readlink -f "${BASH_SOURCE[0]:-$0}")")" &> /dev/null && pwd 2> /dev/null)"

# this will get mounted under /workspace in container
HOST_PROJECT_PATH=$(pwd)

if [ -r "$SCRIPT_DIR/.env-gdc" ]; then
  echo "Loading container .env-gdc environment file"
  source "$SCRIPT_DIR/.env-gdc"
fi

if [ -r "$SCRIPT_DIR/.env-gdc-local" ]; then
  echo "Loading container .env-gdc-local environment file"
  source "$SCRIPT_DIR/.env-gdc-local"
fi

if [ -r ".env-gdc" ]; then
  echo "Loading project .env-gdc environment file"
  source ".env-gdc"
fi
if [ -r ".env-gdc-local" ]; then
  echo "Loading project .env-gdc-local environment file"
  source ".env-gdc-local"
fi

# if we cant change to this folder bail
cd "$SCRIPT_DIR" || exit 1

if [[ -z "$1" || "$1" == "-h" || "$1" == "--help" ]]; then
  echo "usage: $0 STACK_NAME [PORT_FWD1] [PORT_FWD2]"
  echo "current folder will be mounted in container on /workspace."
  echo "Env vars are set in the following order with last to set winning"
  echo "Shell env, $SCRIPT_DIR/.env-gdc, $SCRIPT_DIR/.env-gdc-local, $HOST_PROJECT_PATH/.env-gdc, $HOST_PROJECT_PATH/.env-gdc-local"
  echo "STACK_NAME required, is used to name the stack in case you want to run more than one."
  echo "PORT_FWD1 optional, is in compose port forward format. Example 80:8080. If not provided will fall back to environment variable."
  echo "PORT_FWD2 optional, is in compose port forward format. Example 2000-2020. If not provided will fall back to environment variable."
  echo "Full example: $0 webdev 80:8080"
  exit 0
fi

# this is the stack name for compose
COMPOSE_PROJECT_NAME="$1"

if [ -z "$DEVNET_NAME" ]; then
  echo "Env variable DEVNET_NAME is not set !"
  exit 1
fi

# setup docker devnet network if needed
if [ -z "$(docker network ls --format '{{.Name}}' --filter name="$DEVNET_NAME")" ]; then
  if [ -z "$DEVNET_SUBNET" ]; then
    echo "Env variable DEVNET_SUBNET is not set !"
    exit 1
  fi
  if [ -z "$DEVNET_GATEWAY" ]; then
    echo "Env variable DEVNET_GATEWAY is not set !"
    exit 1
  fi
  echo "Network $DEVNET_NAME not found. creating... as $DEVNET_SUBNET $DEVNET_GATEWAY"
  docker network create --attachable -d bridge --subnet "$DEVNET_SUBNET" --gateway "$DEVNET_GATEWAY" "$DEVNET_NAME"
else
  echo "Network $DEVNET_NAME found"
fi

if [ -n "$2" ]; then
  PORT_FWD1="$2"
fi

if [ -n "$3" ]; then
  PORT_FWD2="$3"
fi

export HOST_PROJECT_PATH
export COMPOSE_PROJECT_NAME
export PORT_FWD1
export PORT_FWD2
export DEVNET_NAME

echo "HOST_PROJECT_PATH = $HOST_PROJECT_PATH"
echo "COMPOSE_PROJECT_NAME = $COMPOSE_PROJECT_NAME"
if [ -n "$PORT_FWD1" ]; then
  echo "PORT_FWD1 = $PORT_FWD1"
fi
if [ -n "$PORT_FWD2" ]; then
  echo "PORT_FWD2 = $PORT_FWD2"
fi

if [ -z "$USE_HOST_HOME" ]; then
  echo "Env variable USE_HOST_HOME is not set !"
  exit 1
fi

COMPOSE_FILES="-f docker-compose.yml"

# enable mounting and copying data from host users home dir
if [ "$USE_HOST_HOME" = "yes" ]; then
  echo "Adding compose layer host-home-dir.yml"
  COMPOSE_FILES="$COMPOSE_FILES -f host-home-dir.yml"
fi

# this will forward port and start ssh server
if [ -n "$SSH_SERVER_PORT" ]; then
  echo "Adding compose layer dc-ssh.yml"
  COMPOSE_FILES="$COMPOSE_FILES -f dc-ssh.yml"
fi
# forwards 1st set of ports
if [ -n "$PORT_FWD1" ]; then
  echo "Adding compose layer dc-port-fwd1.yml"
  COMPOSE_FILES="$COMPOSE_FILES -f dc-port-fwd1.yml"
fi
# forwards 2nd set of ports
if [ -n "$PORT_FWD2" ]; then
  echo "Adding compose layer dc-port-fwd2.yml"
  COMPOSE_FILES="$COMPOSE_FILES -f dc-port-fwd2.yml"
fi

# this will start localstack container
if [ -n "$LS_VERSION" ]; then
  echo "Adding compose layer dc-ls.yml"
  export USE_LOCALSTACK=yes
  COMPOSE_FILES="$COMPOSE_FILES -f dc-ls.yml"
fi

# mount host ls volume dir in container
if [ "$USE_LOCALSTACK" != "no" ]; then
  echo "Adding compose layer ls-volume.yml"
  if [ "$OS" = "Windows_NT" ]; then
    export LOCALSTACK_VOLUME_DIR="/c/tmp/ls_volume"
  else
    export LOCALSTACK_VOLUME_DIR="/tmp/ls_volume"
  fi
  echo "LOCALSTACK_VOLUME_DIR = $LOCALSTACK_VOLUME_DIR"
  if [ ! -r "$LOCALSTACK_VOLUME_DIR" ]; then
    mkdir -p "$LOCALSTACK_VOLUME_DIR"
  fi
  COMPOSE_FILES="$COMPOSE_FILES -f ls-volume.yml"
fi

# this will start auth0 mock server
if [ "$USE_AUTH0" = "yes" ]; then
  echo "Adding compose layer dc-auth0.yml"
  COMPOSE_FILES="$COMPOSE_FILES -f dc-auth0.yml"
fi

# forwards ssh agent socket to container
if [[ -z "$NO_SSH_AGENT" && -r "$SSH_AUTH_SOCK" ]]; then
  if [[ $OSTYPE =~ darwin* && -r "$SSH_AUTH_SOCK" ]]; then # MAC
    echo "Adding compose layer dc-ssh-agent.yml"
    echo "forwarding mac ssh agent to container"
    export SSH_AUTH_SOCK=/run/host-services/ssh-auth.sock
    COMPOSE_FILES="$COMPOSE_FILES -f dc-ssh-agent.yml"
  elif [[ $OSTYPE =~ msys* ]]; then # GIT BASH
    echo "not forwarding windows ssh agent to container. not ready"
    #        export SSH_AUTH_SOCK=//./pipe/openssh-ssh-agent
    #        COMPOSE_FILES="$COMPOSE_FILES -f dc-ssh-agent.yml"
  fi
fi

# add user specified compose file to list
if [ -n "$COMPOSE_EX" ]; then
  echo "Adding compose layer $COMPOSE_EX"
  COMPOSE_FILES="$COMPOSE_FILES -f $COMPOSE_EX"
fi

# remove old stack and prune image files
if [ "$CLEAN" = "yes" ]; then
  docker-compose $COMPOSE_FILES down --rmi all
  docker system prune -f
fi
docker-compose $COMPOSE_FILES up --build --force-recreate
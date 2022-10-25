#!/usr/bin/env bash
bold=$(tput bold)
normal=$(tput sgr0)

USAGE=$(cat <<-END
./ssm-jump-scp.sh [EC2 Bastion instance id] [full-az] [mode] [local-file] '[remote-file]'
   Script to copy a files between localhost host and remote private EC2 instance.
   mode can be ether "push" to send file to instance or "pull" to download file from instance.
   Example Usage to copy from local to instance: ssm-jump-scp.sh i-abcd1234 us-east-1a push myfile.txt '~/myfile.txt'
   Note: Only one file can be copied at a time. The local file will always be first file specified and remote file second.
   The remote file or folder should be quoted to prevent local path expansion.
   Note2: Do not specify the "user@" portion of the loca-file or remote-file.
END
)


# error/helper conditions

if [[ $# -ne 5 ]]; then
  echo "$USAGE" >&2
  exit 1
fi

if ! [ -x "$(command -v aws)" ]; then
  echo 'Error: aws-cli is not installed.' >&2
  echo 'Try installing aws cli v2: go here - https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html' >&2
  echo 'Then install the ssm plugin from - https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html' >&2
  exit 1
fi


instance_id=$1
shift
availability_zone=$1
shift
direction=$1
shift
local_file=$1
shift
remote_file=$1
shift

if [[ "$direction" != "push" && "$direction" != "pull" ]]; then
  echo "$USAGE" >&2
  exit 1
fi

chars=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
key_name="aws_temp_"
for i in {1..16} ; do
    key_name=$key_name"${chars:RANDOM%${#chars}:1}"
done


echo "Generating public key"
echo "ssh-keygen -q -t ed25519 -f ~/.ssh/$key_name -N '' <<<y 2>&1"
ssh-keygen -q -t ed25519 -f ~/.ssh/$key_name -N '' <<<y 2>&1
ret=$?
if [ $ret -ne 0 ]; then
  echo "Failed to generate $key_name rsa key with exit code ($ret). Aborting..."
  exit $ret
fi

echo "copying temp ssh key to instance $instance_id"
echo "aws ec2-instance-connect send-ssh-public-key --instance-id $instance_id --instance-os-user ssm-user --availability-zone $availability_zone --ssh-public-key file://\"~/.ssh/$key_name.pub\""
aws ec2-instance-connect send-ssh-public-key --instance-id $instance_id --instance-os-user ssm-user --availability-zone $availability_zone --ssh-public-key file://"~/.ssh/$key_name.pub"
ret=$?
if [ $ret -ne 0 ]; then
  echo "Failed to copy $key_name rsa key to instance with exit code ($ret). Aborting..."
  rm ~/.ssh/$key_name ~/.ssh/$key_name.pub 2>&1 > /dev/null
  exit $ret
fi

echo "copying file"
ret=0
if [[ "$direction" == "push" ]]; then
  echo "Pushing $local_file to $remote_file on $instance_id"
  echo "scp -i ~/.ssh/$key_name -o \"UserKnownHostsFile=/dev/null\" -o \"StrictHostKeyChecking=no\" -o ProxyCommand=\"aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p\" $local_file ssm-user@$direction:$remote_file"
  scp -r -i ~/.ssh/$key_name -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o ProxyCommand="aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p" $local_file ssm-user@$instance_id:$remote_file
  ret=$?
  if [ $ret -ne 0 ]; then
	echo "Failed to scp exit code ($ret)."
  fi
else
  echo "Pulling $remote_file from $remote_file on $instance_id"
  echo "scp -i ~/.ssh/$key_name -o \"IdentitiesOnly=yes\" -o \"UserKnownHostsFile=/dev/null\" -o \"StrictHostKeyChecking=no\" -o ProxyCommand=\"aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p\" ssm-user@$direction:$remote_file $local_file"
  scp -r -i ~/.ssh/$key_name -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o ProxyCommand="aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters portNumber=%p" ssm-user@$instance_id:$remote_file $local_file
  ret=$?
  if [ $ret -ne 0 ]; then
	echo "Failed to scp exit code ($ret)."
  fi
fi
 rm ~/.ssh/$key_name ~/.ssh/$key_name.pub 2>&1 > /dev/null

# immediately quit after ending the session
exit $ret

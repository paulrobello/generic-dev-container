# auth0-mock

> running auth0 locally in docker form. Build contained within docker compose yml

## Getting Started

### Prerequisites

* Docker / Docker Compose
* Node
* yarn
* mkcert -> discussed further in [Self Signed SSL Cert section](./certs/README.md)

## ENV Config opts (set in docker compose) 
* **APP_PORT** - port that auth0 mock is running on | defaults to 3001
* **AUTH0_HOST** - host that auth0 mock is running on | defaults to localhost:APP_PORT
* **FRONTEND_PORT** - port that frontend is running on | defaults to 3030
* **FRONTEND_PROTOCOL** - protocol that frontend uses | defaults to http
* **FRONTEND_DOMAIN** - domain that frontend is running on | defaults to localhost:FRONTEND_PORT

## Running the app

* cd into directory with docker compose yml (`fos-data-portal/auto_tests`)
* run `docker compose up`
    * startup script is contained within `auth0_mock/package.json -> 'start' script`
* [Setup self signed cert](./certs/README.md) 

## API Documentation

### ROUTES

#### `GET` /

returns list of routes and what they do

#### `GET` /authorize
*official auth0 service uses this route (most frontend frameworks will use it too)*

renders a login page which makes a POST request to login route

#### `GET` /login 
*required params - username & pw* <br>

logs a user in. [Users information can be found here](./users.json)

#### `POST` /login
*official auth0 service uses this route (most frontend frameworks will use it too)*<br>
*required params - username & pw & redirect & state*<br>

logs a user in. [Users information can be found here](./users.json)

#### `GET` /logout

logout user

#### `GET` /v2/logout
*official auth0 service uses this route (most frontend frameworks will use it too)*<br>

logout user

#### `GET` /.well-known/jwks.json
*official auth0 service uses this route (most frontend frameworks will use it too)*<br>
*user must be logged in to access*<br>

Returns JWKeySet

#### `GET` /access_token
*user must be logged in to access*<br>

Returns access_token for user. [access_token props can be found here](./token-claims/access.ts)

#### `GET` /id_token
*user must be logged in to access*<br>

returns id_token for user. [id_token props can be found here](./token-claims/id.ts)

#### `POST` /oauth/token
*user must be logged in to access*<br>
*official auth0 service uses this route (most frontend frameworks will use it too)*<br>
*required body params - client_id* <br>

returns JSON containing access token, id token, expires_in value, scope, and token type

#### `GET` /verify_token_test
*user must be logged in to access*<br>

verifies token for debug purposes - outputs to container logs

#### `GET` /userinfo
*user must be logged in to access*<br>
*official auth0 service uses this route (most frontend frameworks will use it too)*<br>

returns [id claims](./token-claims/id.ts) 

### Modify user and/or properties

To modify a user go into [user.json](./users.json). From here you can add/remove users and properties.

*User json key must be same as username*

*Every user must have a username and a pw*

### Modify token claims

Claims may be modified from within the *Token_Claims* directory. Claim values can be static or pulled from user file (
user.json) or [token defaults file](./token-claims/token_defaults.ts)

### Self Signed SSL Cert
[instructions contained here!](./certs/README.md)

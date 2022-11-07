import {Router} from "express";

export const routerIndex = Router();

// lists all the available routes
routerIndex.get('/', (req, res) => {
  const routes = {
    '/authorize':
      'GET - renders a login page which makes a POST request to login route - official auth0 service uses this route (most frontend frameworks will use it too)',
    '/login':
      'POST|GET - login a user | POST used in conjunction with authorize route',
    '/logout': 'GET - logs a user out - empties active user obj',
    '/v2/logout':
      'GET - official auth0 service uses this route (most frontend frameworks will use it too) -> same function as logout',
    '/.well-known/jwks.json':
      'GET - Returns JWKS | official auth0 service uses this route (most frontend frameworks will use it too)',
    '/jwks':
      'GET - get private keys used to sign tokens | used for debug purposes',
    '/access_token': 'GET - must be logged in - Returns access token for user',
    '/id_token': 'GET - must be logged in - Returns id token for user',
    '/oauth/token':
      'POST - must be logged in - official auth0  service uses this route (most frontend frameworks will use it too) "token route" - returns object with tokens, expires, scope, and token type',
    '/verify_token_test':
      'GET - must be logged in - verifies token for debug purposes - outputs to container logs',
    '/userinfo':
      'GET - must be logged in - official auth0  service uses this route (most frontend frameworks will use it too) - returns userinfo aka id claims'
  };
  return res
    .status(200)
    .header('Content-Type', 'application/json')
    .send(JSON.stringify(routes, null, 4));
});

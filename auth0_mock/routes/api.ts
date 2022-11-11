import jwktopem from "jwk-to-pem";
import {Router, Request, Response} from "express";
import {auth0Url, removeNonceIfEmpty} from "../modules/helpers";
import {checkLogin} from "../modules/middleware";
import {JwkWrapper} from "../modules/jwk-wrapper";
import {accessTokenClaims} from "../token-claims/access";
import {idTokenClaims} from "../token-claims/id";
import {IAccessTokenClaims} from "../types";

export const routerApi: Router = Router();

// Returns JWKS (This is public and does not require login)
routerApi.get('/.well-known/jwks.json', (req: Request, res: Response) => {
    res.status(200).send(JwkWrapper.getKeys());
});

// Get the private key used to sign
routerApi.get('/jwks', async (req: Request, res: Response) => {
    res.status(200).send(jwktopem(JwkWrapper.getKeys(true).keys[0], {private: true}));
});

// Returns access token for user
routerApi.get('/access_token', checkLogin, async (req: Request, res: Response) => {
    res.status(200).send(
        await JwkWrapper.createToken(
            accessTokenClaims('', [`${auth0Url}/userinfo`])
        )
    );
});

// Returns id token for user
routerApi.get('/id_token', checkLogin, async (req: Request, res: Response) => {
    res.status(200).send(
        await JwkWrapper.createToken(removeNonceIfEmpty(idTokenClaims()))
    );
});

// Auth0 token route | returns access && id token
routerApi.post('/oauth/token', checkLogin, async (req: Request, res: Response) => {
    console.log(JwkWrapper.getKeys(true));
    const {client_id}: { client_id: string } = req.body;
    const accessTokenClaim: IAccessTokenClaims = accessTokenClaims(client_id, [
        `${auth0Url}/userinfo`
    ]);
    console.log({accessTokenClaim});
    res.status(200).send({
        access_token: await JwkWrapper.createToken(accessTokenClaim),
        expires_in: 86400,
        id_token: await JwkWrapper.createToken(
            removeNonceIfEmpty(idTokenClaims(client_id))
        ),
        scope: accessTokenClaim.scope,
        token_type: 'Bearer'
    });
});

// Used to verify token
routerApi.get('/verify_token_test', checkLogin, async (req: Request, res: Response) => {
    await JwkWrapper.verify(
        await JwkWrapper.createToken(removeNonceIfEmpty(idTokenClaims()))
    );
    res.status(200).send('done - see logs for details');
});

// Used to get userinfo
routerApi.get('/userinfo', checkLogin, (req: Request, res: Response) => {
    res.status(200).json(removeNonceIfEmpty(idTokenClaims()));
});

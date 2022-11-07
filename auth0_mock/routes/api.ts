import * as jwktopem from "jwk-to-pem";
import * as express from "express";
import {auth0Url, removeNonceIfEmpty} from "../modules/helpers";
import {checkLogin} from "../modules/middleware";
import {JwkWrapper} from "../modules/jwk-wrapper";
import {accessTokenClaims} from "../token-claims/access";
import {idTokenClaims} from "../token-claims/id";

const router = express.Router();

// TODO does router need export since we're not exporting whole object anymore
// Returns JWKS (This is public and does not require login)
router.get('/.well-known/jwks.json', (req, res) => {
    res.status(200).send(JwkWrapper.getKeys());
});

// Get the private key used to sign
router.get('/jwks', async (req, res) => {
    res.send(jwktopem(JwkWrapper.getKeys(true).keys[0], {private: true}));
});

// Returns access token for user
router.get('/access_token', checkLogin, async (req, res) => {
    res.send(
        await JwkWrapper.createToken(
            accessTokenClaims('', [`${auth0Url}/userinfo`])
        )
    );
});

// Returns id token for user
router.get('/id_token', checkLogin, async (req, res) => {
    res.send(
        await JwkWrapper.createToken(removeNonceIfEmpty(idTokenClaims()))
    );
});

// Auth0 token route | returns access && id token
router.post('/oauth/token', checkLogin, async (req, res) => {
    console.log(JwkWrapper.getKeys(true));
    const {client_id} = req.body;
    const accessTokenClaim = accessTokenClaims(client_id, [
        `${auth0Url}/userinfo`
    ]);
    console.log({accessTokenClaim});
    res.send({
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
router.get('/verify_token_test', checkLogin, async (req, res) => {
    await JwkWrapper.verify(
        await JwkWrapper.createToken(removeNonceIfEmpty(idTokenClaims()))
    );
    res.send('done - run docker logs auth0_mock -f to see outputs for debugging');
});

// Used to get userinfo
router.get('/userinfo', checkLogin, (req, res) => {
    res.json(removeNonceIfEmpty(idTokenClaims()));
});

export = router;
// export router;
// module.exports = router;
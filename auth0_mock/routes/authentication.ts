import {Router, Request, Response} from "express";
import {User} from "../modules/user";
import {Auth} from "../modules/authentication";
import {idTokenClaims} from "../token-claims/id";
import {JwkWrapper} from "../modules/jwk-wrapper";
import {accessTokenClaims} from "../token-claims/access";
import {buildUriParams, auth0Url, removeNonceIfEmpty} from "../modules/helpers"

export const routerAuth = Router();

// path renders login page | used in conjunction with auth0 frontend libs | makes POST to login route
routerAuth.get('/authorize', async (req: Request, res: Response) => {
    // const {
    //     redirect_uri,
    //     prompt,
    //     state,
    //     nonce,
    //     audience
    // }: { redirect_uri: string; prompt: string; state: string; nonce: string; audience: string; } = req.query;
    const {redirect_uri, prompt, state, client_id, nonce, audience} = req.query;
    // TODO toString on non existant dont work | need to default it
    JwkWrapper.setNonce(nonce.toString());
    if (!redirect_uri) {
        return res.status(400).send('missing redirect url');
    }
    if (prompt === 'none') {
        console.log('got silent refresh request');
        if (!Auth.loggedIn) {
            console.log('silent refresh user not logged in');
            const varsNoPrompt = {
                state,
                error: 'login_required',
                error_description: 'login_required'
            };
            const paramsNoPrompt = buildUriParams(varsNoPrompt);
            const locationNoPrompt = `${redirect_uri}?${paramsNoPrompt}`;
            console.log('Redirect to Location', locationNoPrompt);
            return res.writeHead(302, {Location: locationNoPrompt}).end();
        }
        console.log('silent refresh user logged in, doing refresh');
        const accessTokenC = accessTokenClaims(audience.toString(), [
            audience.toString(),
            `${auth0Url}/userinfo`
        ]);
        const vars = {
            state,
            code: '1234',
            access_token: await JwkWrapper.createToken(accessTokenC),
            expires_in: 86400,
            id_token: await JwkWrapper.createToken(
                removeNonceIfEmpty(idTokenClaims(audience.toString()))
            ),
            scope: accessTokenC.scope,
            token_type: 'Bearer'
        };
        console.log('silent refresh vars', vars);
        const params = buildUriParams(vars);
        const location = `${redirect_uri}?${params}`;
        console.log('Redirect to Location', location);
        return res.writeHead(302, {Location: location}).end();
    }
    return res.render('../templates/login_page', {
        username: process.env.AUTH0_DEFAULT_USER || 'user1',
        password: process.env.AUTH0_DEFAULT_PASSWORD || 'user1',
        redirect: redirect_uri,
        state
    });
});

// ======================
// login routes
// ======================

// login route | associated with user in user.json file | post made by authorizer route template
routerAuth.post('/login', (req: Request, res: Response) => {
    const logMsg = 'username = ' + req.body.username + ' && pw = ' + req.body.pw;
    const redirect = req.query.redirect || '';
    const state = req.query.state;
    // if logged-in user tries to hit login route twice then just log them out and start over
    if (Auth.loggedIn) {
        Auth.logout();
    }
    // if missing username || password params then error
    if (!req.body.username || !req.body.pw) {
        return res.status(400).send('missing username or password');
    }
    // if login fails
    if (!Auth.login(User.GetUser(req.body.username), req.body.pw)) {
        console.error('invalid login - ' + logMsg);
        return res.status(401).send('invalid username or password');
    }
    // all good in the hood
    console.log('Logged in ' + logMsg);

    return res
        .writeHead(302, {
            Location: `${redirect}?code=1234&state=${encodeURIComponent(state.toString())}`
        })
        .end();
});

// login route | alternative to using /authorizer->POST->/login flow
routerAuth.get('/login', (req: Request, res: Response) => {
    const username: string = (req.query.username || "").toString();
    const password: string = (req.query.pw || "").toString();
    const logMsg = 'username = ' + username + ' && pw = ' + req.query.pw;

    if (Auth.loggedIn) {
        Auth.logout();
    }
    // if missing username || password params then error
    if (!username || !password) {
        return res.status(400).send('missing username or password');
    }
    // if login fails
    if (!Auth.login(User.GetUser(username), password)) {
        console.error('invalid login - ' + logMsg);
        return res.status(401).send('invalid username or password');
    }
    // all good in the hood
    console.log('Logged in ' + logMsg);

    return res
        .status(200)
        .send(
            JSON.stringify(Auth.currentUser) +
            '<br><br><b>you may continue with your auth0 needs</b>'
        );
});

// ======================
// logout routes
// ======================

routerAuth.get('/logout', (req: Request, res: Response) => {
    const currentUser = JSON.stringify(Auth.currentUser);
    Auth.logout();
    console.log(`logged out ${currentUser}`);
    res.status(200).send('logged out');
});

routerAuth.get('/v2/logout', (req: Request, res: Response) => {
    const redirect = req.query.returnTo;
    const currentUser = JSON.stringify(Auth.currentUser);
    Auth.logout();
    console.log(`logged out ${currentUser}`);
    return res
        .writeHead(302, {
            Location: `${redirect}`
        })
        .end();
});

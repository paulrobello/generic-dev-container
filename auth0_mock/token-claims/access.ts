import {Auth} from "../modules/authentication";
import {JwkWrapper} from "../modules/jwk-wrapper";
import {tokenDefaults} from "./token_defaults";

// https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-token-claims
//
// auth token claims -- claim props should be defined within scope of user aka user.json
// if claim not defined in user.json then uses token default values
export const accessTokenClaims = (azp: string = '', aud: string[] = []) => {
    const email = Auth.currentUser.email || tokenDefaults.email;
    return {
        iss: tokenDefaults.domain,
        sub: tokenDefaults.sub + email,
        aud: tokenDefaults.aud.concat(aud),
        iat: JwkWrapper.getIat(),
        exp: JwkWrapper.getExp(),
        azp, // TODO test object literal to make sure no errors
        scope: Auth.currentUser.scope || tokenDefaults.defaultPermissions,
        permissions:
            Auth.currentUser.permissions || tokenDefaults.defaultScope
    };
};

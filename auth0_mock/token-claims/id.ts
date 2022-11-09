import {Auth} from "../modules/authentication";
import {JwkWrapper} from "../modules/jwk-wrapper";
import {tokenDefaults} from "./token_defaults";
import {IIdTokenClaims} from "../types";

// id token claims -- claim props should be defined within scope of user aka user.json
// if claim not defined in user.json then uses token default values
export const idTokenClaims = (aud: string = ''): IIdTokenClaims => {
    const email = Auth.currentUser.email || tokenDefaults.email;
    return {
        given_name: Auth.currentUser.given_name || tokenDefaults.given_name,
        family_name: Auth.currentUser.family_name || tokenDefaults.family_name,
        nickname: Auth.currentUser.nickname || tokenDefaults.nickname,
        name: Auth.currentUser.name || tokenDefaults.name,
        email,
        picture: Auth.currentUser.picture || tokenDefaults.picture,
        iss: tokenDefaults.domain,
        sub: tokenDefaults.sub + email,
        aud: [aud] || tokenDefaults.aud,
        iat: JwkWrapper.getIat(),
        exp: JwkWrapper.getExp(),
        amr: tokenDefaults.amr,
        nonce: JwkWrapper.getNonce()
    };
};

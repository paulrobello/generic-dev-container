import {Authentication} from "../modules/authentication";
import {JWKWrapper} from "../modules/jwk-wrapper";
import {tokenDefaults} from "./token_defaults";

// TODO be careful with multiple class instantiations | singleton way was done before
const JwkWrapper = new JWKWrapper()
const Auth = new Authentication()

// id token claims -- claim props should be defined within scope of user aka user.json
// if claim not defined in user.json then uses token default values
export const idTokenClaims = (aud = '') => {
    const email = Auth.currentUser.email || tokenDefaults.email;
    return {
        given_name: Auth.currentUser.given_name || tokenDefaults.given_name,
        family_name: Auth.currentUser.family_name || tokenDefaults.family_name,
        nickname: Auth.currentUser.nickname || tokenDefaults.nickname,
        name: Auth.currentUser.name || tokenDefaults.name,
        email, // TODO make sure obj literal works as expected
        picture: Auth.currentUser.picture || tokenDefaults.picture,
        iss: tokenDefaults.domain,
        sub: tokenDefaults.sub + email,
        aud: aud || tokenDefaults.aud,
        iat: JwkWrapper.getIat(),
        exp: JwkWrapper.getExp(),
        amr: tokenDefaults.amr,
        nonce: JwkWrapper.getNonce()
    };
};

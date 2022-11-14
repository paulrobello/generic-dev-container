import {accessTokenClaims} from "../../token-claims/access";
import {tokenDefaults} from "../../token-claims/token_defaults";

describe("access token claims tests", () => {
    it("should return IAccessTokenClaims property", () => {
        const defaultProps: string[] = [
            "iss",
            "sub",
            "aud",
            "iat",
            "exp",
            "azp",
            "scope",
            "permissions"
        ];
        const accessClaims = accessTokenClaims();
        expect(defaultProps.every(key => Object.keys(accessClaims).includes(key))).toBeTruthy();
    });
    it("should set azp to what the user sets", () => {
        const azpVal = "yes";
        const accessClaims = accessTokenClaims(azpVal);
        expect(accessClaims.azp).toEqual(azpVal)
    });
    it("should set aud to what was passed in", () => {
        const audVal = ["peter", "bug", "king"];
        const accessClaims = accessTokenClaims("yes", audVal);
        expect(accessClaims.aud).toEqual(tokenDefaults.aud.concat(audVal));
    });
});
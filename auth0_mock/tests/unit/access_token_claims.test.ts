import {IAccessTokenClaims} from "../../types";
import {accessTokenClaims} from "../../token-claims/access";
import {tokenDefaults} from "../../token-claims/token_defaults";

describe("access token claims tests", () => {
    it("should return IAccessTokenClaims property", () => {
        const accessClaims = accessTokenClaims();
        expect("iss" in accessClaims)
        // expect(accessClaims.iss === null).toBeFalsy();
        // expect(Object.keys(IAccessTokenClaims) in accessClaims)
        // expect(typeof accessClaims === IAccessTokenClaims)
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
// TODO maybe test that type that is returned is IAccessTokenClaims
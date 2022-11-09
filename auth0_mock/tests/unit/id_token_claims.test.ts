import {idTokenClaims} from "../../token-claims/id";

describe("id token claims tests", () => {
    it("should return IIdTokenClaims property", () => {
        const accessClaims = idTokenClaims();
        expect("given_name" in accessClaims)
    });
    it("should set aud to what the user sets via param", () => {
        const aud = "pking";
        const accessClaims = idTokenClaims(aud);
        expect(accessClaims.aud).toEqual([aud])
    });
});
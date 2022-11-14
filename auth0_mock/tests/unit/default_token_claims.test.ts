import {tokenDefaults} from "../../token-claims/token_defaults";

describe("testing token Defaults", () => {
    it("should return defaults specified properties", () => {
        const defaultProps: string[] = [
            "domain",
            "sub",
            "defaultPermissions",
            "defaultScope",
            "aud",
            "given_name",
            "family_name",
            "nickname",
            "name",
            "email",
            "picture",
            "amr"
        ];
        expect(Object.keys(tokenDefaults).every(key => defaultProps.includes(key))).toBeTruthy();
    });
});
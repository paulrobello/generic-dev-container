import fs from "fs";
import {JwkWrapper} from "../../modules/jwk-wrapper";
import {idTokenClaims} from "../../token-claims/id";

describe("JWKWrapper tests", () => {
    it("should return Nonce when getNonce is called", () => {
        // set nonce
        const nonce = "1234"
        JwkWrapper.setNonce(nonce);
        expect(JwkWrapper.getNonce()).toEqual(nonce)
    });
    it("should set Nonce when setNonce is called", () => {
        ["1234", "4321", "9876", "6789"].forEach((value) => {
            JwkWrapper.setNonce(value);
            expect(JwkWrapper.getNonce()).toEqual(value);
        });
    });
    // TODO could be better test
    it("should get IAT (a number) when getIat is called", () => {
        expect(typeof JwkWrapper.getIat() === "number").toBeTruthy();
    });
    // TODO could be better test
    it("should get exp date (a number) when getExp is called", () => {
        expect(typeof JwkWrapper.getExp() === "number").toBeTruthy();
    });
    it("should create JWKS file when createJwks is called", () => {
        const filePath = "../../keys.json";
        // make sure keys.json is deleted
        fs.unlinkSync(filePath);
        // run method
        JwkWrapper.createJwks();
        expect(fs.existsSync(filePath)).toBeTruthy();
    });
    // TODO finish | we need to make sure that jwt token is what it is
    // it("should create a token", async () => {
    //     const token = await JwkWrapper.createToken(idTokenClaims());
    //     const isValidJwt = (jwtToken: string): boolean => {
    //         try {
    //             if (!assert.isString(jwtToken) || assert.isUndefined(process.version as any)) return false
    //
    //             const jwtValidToken: string[] = jwtToken.split('.')
    //             if (jwtValidToken.length !== 3) return false
    //
    //             JSON.parse(Buffer.from(jwtValidToken[0], 'base64').toString())
    //             JSON.parse(Buffer.from(jwtValidToken[1], 'base64').toString())
    //             return true
    //         } catch (e) {
    //             return false
    //         }
    //     }
    //     expect()
    // });
    // TODO nothing really to test with verify?
});
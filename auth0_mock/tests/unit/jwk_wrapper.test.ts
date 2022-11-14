import fs from "fs";
import {JwkWrapper} from "../../modules/jwk-wrapper";
import {sleep} from "../utils";
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
    it("should get IAT (a number) when getIat is called", () => {
        expect(typeof JwkWrapper.getIat() === "number").toBeTruthy();
    });
    it("should get exp date (a number) when getExp is called", () => {
        expect(typeof JwkWrapper.getExp() === "number").toBeTruthy();
    });
    it("should create JWKS file when createJwks is called", async () => {
        const filePath = "./keys.json";
        // make sure keys.json is deleted
        fs.unlinkSync(filePath);
        // run method
        JwkWrapper.createJwks();
        // fails without sleep even though usage is synchronous
        await sleep(.00000000000000000000000000000001);
        console.log(fs.existsSync(filePath));
        // should create file
        expect(fs.existsSync(filePath)).toBeTruthy();
    });
    it("should create a token when createToken is called with given claims", async () => {
        const token = await JwkWrapper.createToken(idTokenClaims());
        expect(token.toString().split(".").length === 3).toBeTruthy();
        expect(JwkWrapper.verify(token)).toBeTruthy()
    });
    it("should return true if no issues with verifying token when verify is called", async () => {
        const token = await JwkWrapper.createToken(idTokenClaims());
        const logSpy = jest.spyOn(console, 'log');
        expect(JwkWrapper.verify(token)).toBeTruthy()
        expect(logSpy).toHaveBeenCalled();

    });
});
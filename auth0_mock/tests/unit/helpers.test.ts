import * as types from "../../types";
import * as helpers from "../../modules/helpers";
import {idTokenClaims} from "../../token-claims/id";

describe("testing helper functions", () => {
    describe("testing removeNonceIfEmpty", () => {
        it("should remove nonce if it is empty", () => {
            let idTokenC = idTokenClaims()
            expect('nonce' in idTokenC).toBeTruthy();
            expect(idTokenC.nonce === "").toBeTruthy();
            idTokenC = helpers.removeNonceIfEmpty(idTokenC)
            expect('nonce' in idTokenC).toBeFalsy();
            expect(idTokenC.nonce === "").toBeFalsy();
        });

        it("should not remove nonce if it is not empty", () => {
            let idTokenC: types.IIdTokenClaims = idTokenClaims();
            const nonceVal: string = "123";
            idTokenC.nonce = nonceVal;
            expect('nonce' in idTokenC).toBeTruthy();
            expect(idTokenC.nonce === nonceVal).toBeTruthy();
            idTokenC = helpers.removeNonceIfEmpty(idTokenC);
            expect('nonce' in idTokenC).toBeTruthy();
            expect(idTokenC.nonce === nonceVal).toBeTruthy();
        });
    });

    describe("testing removeTrailingSlash", () => {
        it("should remove trailing slash when trailing slash exists", () => {
            let str: string = "this has a trailing slash /";
            expect(str.endsWith("/")).toBeTruthy();
            str = helpers.removeTrailingSlash(str);
            expect(str.endsWith("/")).toBeFalsy();
        });
        it("should not remove trailing slash when trailing slash is not present", () => {
            const str: string = "this doesn't have a trailing slash";
            expect(str.endsWith("/")).toBeFalsy();
            const strTwo: string = helpers.removeTrailingSlash(str);
            expect(str.endsWith("/")).toBeFalsy();
            expect(str === strTwo).toBeTruthy();
        });

    });

    describe("testing buildUriParams", () => {
        it("should take in object & return uri formatted string", () => {
            let v: any = {
                state: "1234",
                error: 'login_required',
                error_description: 'login_required'
            }
            expect(typeof v === "string").toBeFalsy();
            v = helpers.buildUriParams(v);
            expect(typeof v === "string").toBeTruthy();
        });
    });

    describe("testing port const", () => {
        it("should return a number in base 10", () => {
            expect(helpers.port === parseInt(helpers.port.toString(), 10)).toBeTruthy();
        });
    });

    describe("testing auth0Url const", () => {
        it("should return url string", () => {
            expect(typeof helpers.auth0Url === "string").toBeTruthy();
            expect((helpers.auth0Url).includes("http://")).toBeTruthy();
            expect((helpers.auth0Url).includes(`:${helpers.port}`)).toBeTruthy();
        });
    });
});


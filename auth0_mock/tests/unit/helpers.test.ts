import * as helpers from "../../modules/helpers";
import * as types from "../../types";
import {idTokenClaims} from "../../token-claims/id";

describe("helper functions", () => {

    test("removeNonceIfEmpty should remove nonce if it is empty", () => {
        let idTokenC = idTokenClaims()
        expect('nonce' in idTokenC).toBeTruthy();
        expect(idTokenC.nonce === "").toBeTruthy();
        idTokenC = helpers.removeNonceIfEmpty(idTokenC)
        expect('nonce' in idTokenC).toBeFalsy();
        expect(idTokenC.nonce === "").toBeFalsy();
    });

    test("removeNonceIfEmpty should not remove nonce if it is not empty", () => {
        let idTokenC: types.IIdTokenClaims = idTokenClaims()
        const nonceVal: string = "123"
        idTokenC.nonce = nonceVal;
        expect('nonce' in idTokenC).toBeTruthy();
        expect(idTokenC.nonce === nonceVal).toBeTruthy();
        idTokenC = helpers.removeNonceIfEmpty(idTokenC)
        expect('nonce' in idTokenC).toBeTruthy();
        expect(idTokenC.nonce === nonceVal).toBeTruthy();
    });

});


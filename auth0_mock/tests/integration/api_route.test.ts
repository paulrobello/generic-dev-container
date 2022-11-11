import {join} from "path";
import {JWS} from "node-jose";
import app from "../../index";
import request from "supertest";
import {readFileSync} from "fs";
import {IUsers} from "../../types";
import {Auth} from "../../modules/authentication";
import {idTokenClaims} from "../../token-claims/id";
import {JwkWrapper} from "../../modules/jwk-wrapper";

describe("testing api routes", () => {
    beforeEach(async () => {
        Auth.logout();
        const username: string = "admin1";
        const password: string = "admin1";
        const userObject: IUsers = JSON.parse(readFileSync(join("./", "users.json"), 'utf8'))[username];
        Auth.login(userObject, password);
    });
    it("should return keys when /.well-known/jwks.json is hit", async () => {
        const res = await request(app).get("/.well-known/jwks.json");
        expect(res.status).toEqual(200);
        expect(res.headers["content-type"].includes("application/json"));
        expect("keys" in res.body);
    });
    it("should return return private key used to sign when /jwks is hit", async () => {
        const res = await request(app).get("/jwks");
        expect(res.status).toEqual(200);
        expect(res.headers["content-type"].includes("text/html"));
        expect(res.text.toLowerCase().includes("private key"));
    });
    it("should return access token when /access_token is hit", async () => {
        const res = await request(app).get("/access_token");
        expect(res.status).toEqual(200);
        expect(res.headers["content-type"].includes("text/html"));
        expect(JwkWrapper.verify(res.text as unknown as JWS.CreateSignResult)).toBeTruthy();
    });
    it("should return ID token when /id_token is hit", async () => {
        const res = await request(app).get("/id_token");
        expect(res.status).toEqual(200);
        expect(res.headers["content-type"].includes("text/html"));
        expect(JwkWrapper.verify(res.text as unknown as JWS.CreateSignResult)).toBeTruthy();
    });
    it("should create oauth token object when /oauth/token is hit", async () => {
        const res = await request(app).post("/oauth/token").send({client_id: "1234"});
        expect(res.status).toEqual(200);
        expect(res.headers["content-type"].includes("application/json"));
        const body = res.body;
        expect("access_token" in body).toBeTruthy();
        expect("expires_in" in body).toBeTruthy();
        expect("id_token" in body).toBeTruthy();
        expect("scope" in body).toBeTruthy();
        expect("token_type" in body).toBeTruthy();
        expect(JwkWrapper.verify(body.access_token as unknown as JWS.CreateSignResult)).toBeTruthy();
        expect(JwkWrapper.verify(body.id_token as unknown as JWS.CreateSignResult)).toBeTruthy();
    });
    it("should verify token via logs & send msg including done when /verify_token_test is hit", async () => {
        const res = await request(app).get("/verify_token_test");
        expect(res.headers["content-type"].includes("text/html"));
        expect(res.text.toLowerCase().includes("done"));
    });
    it("should return userinfo in json format when /userinfo is hit", async ()=>{
        const res = await request(app).get("/userinfo");
        expect(res.headers["content-type"].includes("application/json"));
        // userinfo is ID token claim | make sure props returned are contained in idTokenClaims
        expect(Object.keys(res.body).every(key => Object.keys(idTokenClaims()).includes(key))).toBeTruthy();
    });
});

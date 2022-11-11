import {join} from "path";
import app from "../../index";
import {readFileSync} from "fs";
import request from "supertest";
import {IUsers} from "../../types";
import {UsersDefaults} from "../../types";
import {Auth} from "../../modules/authentication";
import {JwkWrapper} from "../../modules/jwk-wrapper";

describe("Authentication route tests", () => {
    describe("/authorize route tests", () => {
        it("should set none to param provided", async () => {
            const nonce = "1234-4321";
            await request(app).get(`/authorize?nonce=${nonce}`);
            expect(JwkWrapper.getNonce()).toEqual(nonce);
        });
        it("should yield 400 with msg if redirect url is not in query string", async () => {
            const res = await request(app).get(`/authorize`);
            expect(res.headers["content-type"].includes("text/html"));
            expect(res.status).toEqual(400);
            expect(res.text.toLowerCase().includes("missing redirect url")).toBeTruthy();
        });
        it("should yield html login prompt if prompt is not set to none", async () => {
            const res = await request(app).get(`/authorize?redirect_uri=1234`);
            expect(res.headers["content-type"].includes("text/html"));
            expect(res.text.includes("<html"));
        });
        it("should yield 302 & redirect to redirect URI with error when prompt is set to none & user not logged in", async () => {
            const redirectUri = "testing_is_cool"
            const state = "234";
            const res = await request(app).get(`/authorize?redirect_uri=${redirectUri}&prompt=none&state=${state}`);
            expect(res.status).toEqual(302);
            const expectedParams = [redirectUri, `state=${state}`, "error=login_required", "error_description=login_required"]
            expectedParams.forEach((v) => {
                expect(res.headers.location.includes(v)).toBeTruthy();
            });
        });
        it("should yield 302 & redirect to redirect URI with specific params when prompt is set to none & user logged in", async () => {
            const username: string = "admin1";
            const password: string = "admin1";
            const userObject: IUsers = JSON.parse(readFileSync(join("./", "users.json"), 'utf8'))[username];
            Auth.login(userObject, password);
            const redirectUri = "testing_is_cool"
            const state = "234";
            const res = await request(app).get(`/authorize?redirect_uri=${redirectUri}&prompt=none&state=${state}`);
            expect(res.status).toEqual(302);
            const expectedParams = [redirectUri, `state=${state}`, "code=1234", "access_token", "expires_in=86400", "id_token", "scope", "token_type=Bearer"]
            expectedParams.forEach((v) => {
                expect(res.headers.location.includes(v)).toBeTruthy();
            });
        });
    });
    describe("/login route tests", () => {
        describe("post alternative", () => {
            it("should yield 400 status code & error message is username or password is not provided or empty", async () => {
                const res = await request(app).post(`/login`);
                expect(res.text.toLowerCase().includes("missing username or password"));
                expect(res.headers["content-type"].includes("text/html"));
                expect(res.status).toEqual(400);
            });
            it("should yield 401 status code & error message user or username is invalid", async () => {
                const validUser = "admin1";
                const invalidPassword = "invalid";
                const res = await request(app).post(`/login`).send({username: validUser, pw: invalidPassword});
                expect(res.text.toLowerCase().includes("invalid username or password"));
                expect(res.headers["content-type"].includes("text/html"));
                expect(res.status).toEqual(401);
            });
            it('should yield status code 302 and pass on specified query params when login successful', async () => {
                const validUser = "admin1";
                const validPw = "admin1";
                const redirectUri = "testing";
                const state = "9078";
                const res = await request(app).post(`/login`)
                    .send({
                        username: validUser,
                        pw: validPw,
                        state,
                        redirect: redirectUri
                    });
                expect(res.status).toEqual(302);
                const expectedParams = [redirectUri, `state=${state}`, "code=1234"]
                expectedParams.forEach((v) => {
                    expect(res.headers.location.includes(v)).toBeTruthy();
                });
            });
        });
        describe("get alternative", () => {
            it("should yield 400 status code & error message is username or password is not provided or empty", async () => {
                const res = await request(app).get(`/login`);
                expect(res.text.toLowerCase().includes("missing username or password"));
                expect(res.headers["content-type"].includes("text/html"));
                expect(res.status).toEqual(400);
            });
            it("should yield 401 status code & error message user or username is invalid", async () => {
                const validUser = "admin1";
                const invalidPassword = "invalid";
                const res = await request(app).get(`/login?username=${validUser}&pw=${invalidPassword}`);
                expect(res.text.toLowerCase().includes("invalid username or password"));
                expect(res.headers["content-type"].includes("text/html"));
                expect(res.status).toEqual(401);
            });
            it('should yield status code 302 and pass on specified query params when login successful', async () => {
                const validUser = "admin1";
                const validPw = "admin1";
                const res = await request(app).get(`/login?username=${validUser}&pw=${validPw}`)
                expect(res.status).toEqual(200);
                expect(res.headers["content-type"].includes("text/html"));
                expect(res.text.includes("username")).toBeTruthy();
                expect(res.text.includes("pw")).toBeTruthy();
                expect(res.text.includes(validPw));
            });
        });
    });
    describe("logout route tests", () => {
        beforeEach(async () => {
            const username: string = "admin1";
            const password: string = "admin1";
            const userObject: IUsers = JSON.parse(readFileSync(join("./", "users.json"), 'utf8'))[username];
            Auth.login(userObject, password);
        });
        describe("/logout", () => {
            it("should log a user out & return 200 statusCode", async () => {
                // user is logged in
                expect(Auth.currentUser.username).toEqual("admin1");
                const res = await request(app).get(`/logout`);
                // user is logged out & props are reset to default
                expect(Auth.currentUser).toEqual(UsersDefaults);
                expect(res.status).toEqual(200);
                expect(res.headers["content-type"].includes("text/html"));
                expect(res.text.toLowerCase().includes("logged out"))
            });
        });
        describe("/v2/logout", ()=>{
           it("should log a user out & redirect to specified URL", async ()=>{
               // user is logged in
               expect(Auth.currentUser.username).toEqual("admin1");
               const redirectUri = "test";
               const res = await request(app).get(`/v2/logout?returnTo=${redirectUri}`);
               // user is logged out & props are reset to default
               expect(Auth.currentUser).toEqual(UsersDefaults);
               expect(res.status).toEqual(302);
               expect(res.headers.location).toEqual(redirectUri)
           });
        });
    });
});
import app from "../../index";
import request from "supertest";

describe("testing index router", () => {
    it("should return list of all routes", async () => {
        const res = await request(app).get("/");
        // if routes are added to index they need to be added here
        const routes = [
            "/authorize",
            "/login",
            "/logout",
            "/v2/logout",
            "/.well-known/jwks.json",
            "/jwks",
            "/access_token",
            "/id_token",
            "/oauth/token",
            "/verify_token_test",
            "/userinfo"
        ]
        expect(res.headers["content-type"].includes("application/json"));
        expect(Object.keys(res.body).every(key => routes.includes(key))).toBeTruthy();
    });
});
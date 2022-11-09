import * as middleware from "../../modules/middleware";
import {Request, Response, NextFunction} from "express";
import httpMocks from "node-mocks-http";
import {IUsers} from "../../types";
import {readFileSync} from "fs";
import {join} from "path";
import {Auth} from "../../modules/authentication";


describe("middleware tests", () => {
    function nextFunc(): NextFunction {
        return true as unknown as NextFunction;
    }

    describe("checkLogin tests", () => {
        beforeEach(() => {
            Auth.logout();
        });
        it('should return next if logged in', () => {
            const request: Request = httpMocks.createRequest();
            const response: Response = httpMocks.createResponse();
            const username: string = "admin1";
            const password: string = "admin1";
            const userObject: IUsers = JSON.parse(readFileSync(join("./", "users.json"), 'utf8'))[username];

            // login successfully
            expect(Auth.login(userObject, password)).toBeTruthy();

            // nextFunc returns true so we check against a truthy return
            expect(middleware.checkLogin(request, response, nextFunc)).toBeTruthy();
        });
        it("should return a status code of 401 & body containing Unauthorized if not logged in", () => {
            const request: Request = httpMocks.createRequest();
            // cant type this with express typing since we're using mock special funcitonality
            const response: httpMocks.MockResponse<Response<any, Record<string, any>>> = httpMocks.createResponse();

            // run middleware function
            middleware.checkLogin(request, response, nextFunc)

            // check response object
            expect(response.statusCode).toEqual(401);
            expect(response._getData().toLowerCase().includes("unauthorized")).toBeTruthy();

        });
    });
    // TODO could do some things with mocking console.log but not really needed 
    // describe("rawReqLogger tests", () => {
    //     it("should console.log things & return nextFunc", () => {
    //         const request: Request = httpMocks.createRequest();
    //         const response: Response = httpMocks.createResponse();
    //
    //         expect(middleware.rawReqLogger(request, response, nextFunc))
    //     });
    // });
});
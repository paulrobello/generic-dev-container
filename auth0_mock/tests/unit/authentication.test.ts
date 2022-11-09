import {Auth} from "../../modules/authentication";
import {IUsers, UsersDefaults} from "../../types";
import {readFileSync} from "fs";
import {join} from "path";

describe("testing Authentication class instance", () => {
    beforeEach(() => {
        Auth.logout();
    });
    it("should log a user in when user is valid", () => {
        const username: string = "admin1";
        const password: string = "admin1";
        const userObject: IUsers = JSON.parse(readFileSync(join("./", "users.json"), 'utf8'))[username];

        // pre-login
        expect(Auth.loggedIn).toBeFalsy();
        expect(Auth.currentUser).toEqual(UsersDefaults);
        // login should be successful & return true
        expect(Auth.login(userObject, password)).toBeTruthy();
        // post login props
        expect(Auth.loggedIn).toBeTruthy();
        expect(Auth.currentUser).toEqual(userObject);
    });

    it("should not log a user in when a user is invalid", () => {
        const username: string = "not_valid_username";
        const password: string = "not_valid_password";
        const userObject: IUsers = JSON.parse(readFileSync(join("./", "users.json"), 'utf8'))[username];

        // pre-login
        expect(Auth.loggedIn).toBeFalsy();
        expect(Auth.currentUser).toEqual(UsersDefaults);
        // login should be successful & return true
        expect(Auth.login(userObject, password)).toBeFalsy();
        // post login props
        expect(Auth.loggedIn).toBeFalsy();
        expect(Auth.currentUser).toEqual(UsersDefaults);
    });

    it('should set user properties back to default when logged out', () => {
        // pre-login
        const defaultLoggedIn: boolean = Auth.loggedIn;
        const defaultCurrentUser: IUsers = Auth.currentUser;
        const username: string = "admin1";
        const password: string = "admin1";
        const userObject: IUsers = JSON.parse(readFileSync(join("./", "users.json"), 'utf8'))[username];

        // successful login
        expect(Auth.login(userObject, password)).toBeTruthy();

        // post login props
        expect(Auth.loggedIn).toBeTruthy();
        expect(Auth.currentUser).toEqual(userObject);

        // logout
        Auth.logout();

        // post logout prop comparison
        expect(Auth.loggedIn).toEqual(defaultLoggedIn);
        expect(Auth.currentUser).toEqual(defaultCurrentUser);

    });
});
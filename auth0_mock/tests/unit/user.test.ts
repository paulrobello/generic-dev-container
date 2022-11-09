import {User} from "../../modules/user";
import {IUsers, UsersDefaults} from "../../types";
import {readFileSync} from "fs";
import {join} from "path";

describe("testing user class instance", () => {
    it("should return user if user exists in users.json", () => {
        const username: string = "admin1";
        const userList: Record<string, any> = JSON.parse(readFileSync(join("./", "users.json"), 'utf8'));
        expect(userList[username].username === "").toBeFalsy();
        expect(User.getUser(username).username === "").toBeFalsy();
        // TODO how to check against interface 
        // expect(User.getUser(username) instanceof IUsers).toBeTruthy();
        // expect(typeof User.getUser(username) ===  IUsers).toBeTruthy();
    });

    it("should return user defaults if user doesn't exist", () => {
        const username: string = "user_dont_exist";
        expect(User.getUser(username) === UsersDefaults).toBeTruthy();
    });
});
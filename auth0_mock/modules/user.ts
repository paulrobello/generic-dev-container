import {join} from "path";
import {readFileSync, existsSync} from "fs";
import {IUsers, UsersDefaults} from "../types";

class Users {
    // TODO can we make string be === IUsers username to enforce it?
    private readonly userList: Record<string, IUsers>;

    constructor(userFileName: string = "", userFileDir: string = './') {
        if (!userFileName) {
            if (existsSync('./users-local.json')) {
                console.log('using: users-local.json');
                userFileName = 'users-local.json';
            } else {
                console.log('using: users.json');
                userFileName = 'users.json';
            }
        }
        // parse user config file
        this.userList = JSON.parse(readFileSync(join(userFileDir, userFileName), 'utf8'));
    }

    // get user object for specific username
    public getUser(username: string): IUsers {
        return this.userList[username] || UsersDefaults;
    }
}

export const User = new Users()

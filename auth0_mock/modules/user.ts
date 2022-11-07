import {join} from "path";
import {readFileSync, existsSync} from "fs";

class Users {
    // TODO JSON === string but can we type json itself for structure?
    public userList: string;

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
    GetUser(username: string): any {
        // TODO doesnt like string lookup on object
        return this.userList[username] || {};
    }
}

export const User = new Users()
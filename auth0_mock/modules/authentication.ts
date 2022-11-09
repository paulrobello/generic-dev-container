import {IUsers, UsersDefaults} from "../types";

class Authentication {
    public loggedIn: boolean;
    public currentUser: IUsers;

    constructor() {
        this.loggedIn = false;
        this.currentUser = UsersDefaults;
    }

    // log a user in
    // if userObj is passed in & not empty then username was correct & only pw needs to be checked
    login(userObj: IUsers, pw: string): boolean {
        if (
            userObj &&
            "pw" in userObj &&
            userObj.pw.toLowerCase() === pw.toLowerCase()
        ) {
            this.loggedIn = true;
            this.currentUser = userObj;
            return true;
        }
        return false;
    }

    // log a user out
    logout(): void {
        this.loggedIn = false;
        this.currentUser = UsersDefaults;
        console.log('logged out');
    }

}

export const Auth = new Authentication()
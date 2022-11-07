// TODO may need to be singleton so all share same instance

export class Authentication {
    public loggedIn: boolean;
    public currentUser: any;

    // TODO need better type hinting

    constructor() {
        this.loggedIn = false;
        this.currentUser = {};
    }

    // log a user in
    // if userObj is passed in & not empty then username was correct & only pw needs to be checked
    login(userObj: any, pw: any) {
        if (
            userObj.hasOwnProperty('pw') &&
            userObj.pw.toLowerCase() === pw.toLowerCase()
        ) {
            this.loggedIn = true;
            this.currentUser = userObj;
            return true;
        }
        return false;
    }

    // log a user out
    logout() {
        this.loggedIn = false;
        this.currentUser = {};
        console.log('logged out');
    }

}


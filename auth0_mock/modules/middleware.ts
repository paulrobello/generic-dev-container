import {Auth} from './authentication'

// TODO better type hinting on express obj's | check for lib || type
// checks if user is logged in
export function checkLogin(req: any, res: any, next: any) {
    if (Auth.loggedIn) {
        return next();
    }
    console.log('Error user not logged in');
    return res.status(401).send('Unauthorized. User not logged in');
}

export function rawReqLogger(req: any, res: any, next: any) {
    // Debug helper | logs props for all requests
    console.log('==========================================');
    console.log(new Date().toISOString(), 'raw request logging');
    console.log('==========================================');
    console.log('route ' + req.path + ' hit \n');
    console.log('req headers ' + JSON.stringify(req.headers) + '\n');
    console.log('req body ' + JSON.stringify(req.body) + '\n');
    console.log('req params ' + JSON.stringify(req.params) + '\n');
    console.log('==========================================');

    return next();
}
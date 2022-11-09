import {Auth} from './authentication'
import {Request, Response, NextFunction} from "express";

// checks if user is logged in
export function checkLogin(req: Request, res: Response, next: NextFunction): Response | void {
    if (Auth.loggedIn) {
        return next();
    }
    console.log('Error user not logged in');
    return res.status(401).send('Unauthorized. User not logged in');
}

// logs raw request props
export function rawReqLogger(req: Request, res: Response, next: NextFunction): void {
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

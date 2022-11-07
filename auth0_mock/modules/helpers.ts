// TODO better type hinting not just any
// TODO use interfaces for obj's
export function removeNonceIfEmpty(obj: any) {
    if ('nonce' in obj && obj.nonce === '') {
        delete obj.nonce;
    }
    return obj;
}

export function removeTrailingSlash(str: any) {
    return str.endsWith('/') ? str.slice(0, -1) : str;
}

export function buildUriParams(vars: any) {
    return Object.keys(vars)
        .reduce((a, k) => {
            a.push(`${k}=${encodeURIComponent(vars[k])}`);
            return a;
        }, [])
        .join('&');
}

export const port: number = parseInt(process.env.APP_PORT, 10) || 3001;
export const auth0Url: string = process.env.AUTH0_DOMAIN || 'http://localhost:' + port;

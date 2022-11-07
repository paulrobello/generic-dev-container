import * as jose from "jose"
import * as jwt from "jsonwebtoken"
import * as jwkToPem from "jwk-to-pem"
import {existsSync, readFileSync, writeFileSync} from "fs"
// import {JWK, JWS} from 'jose' TODO dont want to import whole thing

export class JWKWrapper {
    // todo modify access levels access modifiers as needed
    public kty: string;
    public size: number;
    public jwkFileName: string;
    public expirationDurationInMinutes: number;
    public nonce: string;
    // TODO better typing here interface
    public props: any;
    public keyStore: any;

    constructor(
        kty = 'RSA',
        size = 2048,
        props = {alg: 'RS256', use: 'sig'},
        jwkFileName = 'keys.json'
    ) {
        this.kty = kty;
        this.size = size;
        this.props = props;
        this.jwkFileName = jwkFileName;
        this.keyStore = jose.JWK.createKeyStore();
        // 1440 minutes === 24 hours
        this.expirationDurationInMinutes = 1440;
        this.nonce = '';
        this.createJwks();
    }

    // return nonce
    getNonce() {
        return this.nonce;
    }

    // TODO not needed if public
    setNonce(nonce: string) {
        this.nonce = nonce;
    }

    // generate & return iat value
    getIat(): number {
        return Math.floor(Date.now() / 1000);
    }

    // generate & return exp value
    getExp(): number {
        return Math.floor(
            (Date.now() + this.expirationDurationInMinutes * 60 * 1000) / 1000
        );
    }

    // Create key set and store on local file system
    createJwks() {
        console.log('Creating JWKS store');
        let keyStorePromise = null;
        if (existsSync('./ext_pk/auth0_jwk.json')) {
            console.log('Found external JWK file, loading it in store');
            const keyData = readFileSync('./ext_pk/auth0_jwk.json', {
                encoding: 'utf8',
                flag: 'r'
            });
            const keyJson = JSON.parse(keyData);
            // TODO better promise typings
            keyStorePromise = jose.JWK.asKeyStore([keyJson]).then((result: any) => {
                // {result} is a jose.JWK.KeyStore
                this.keyStore = result;
            });
        } else {
            console.log('Generate new JWKS store');
            keyStorePromise = this.keyStore.generate(this.kty, this.size, this.props);
        }

        keyStorePromise.then((result: any) =>
            writeFileSync(
                this.jwkFileName,
                JSON.stringify(this.keyStore.toJSON(true), null, '  ')
            )
        );
    }

    // return key set
    getKeys(includePrivateKey: boolean = false, retType: string = '') {
        retType = retType.toLowerCase() || '';
        if (retType !== 'json' || !retType) {
            retType = 'json';
        }
        if (retType === 'json') {
            return this.keyStore.toJSON(includePrivateKey);
        }
        return this.keyStore;
    }

    // TODO better typing on payload
    // create token with given payload & options
    async createToken(payload: any, opt = {}) {
        const key = this.keyStore.all({use: 'sig'})[0];

        // default options if none passed in
        if (Object.keys(opt).length === 0) {
            opt = {compact: true, jwk: key, fields: {typ: 'jwt'}};
        }

        return await jose.JWS.createSign(opt, key)
            .update(JSON.stringify(payload))
            .final();
    }

    async verify(token: any) {
        console.log('verify token');

        // Use first sig key
        const key = this.keyStore.all({use: 'sig'})[0];
        const v = await jose.JWS.createVerify(this.keyStore).verify(token);
        console.log('token');
        console.log(token);
        console.log('Verify Token');
        console.log(v.header);
        console.log(v.payload.toString());

        // Verify Token with jsonwebtoken
        const publicKey = jwkToPem(key.toJSON());
        const privateKey = jwkToPem(key.toJSON(true), {private: true});

        console.log('public', publicKey);
        console.log('private', privateKey);

        const decoded = jwt.verify(token, publicKey);
        console.log('decoded', decoded);
    }
}

// module.exports = new JWKWrapper();

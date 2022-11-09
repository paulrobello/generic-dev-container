import {JWK, JWS} from "node-jose";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import {existsSync, readFileSync, writeFileSync} from "fs";
import {IIdTokenClaims, IAccessTokenClaims} from "../types";

class JWKWrapper {
    private readonly kty: string;
    private readonly size: number;
    private readonly jwkFileName: string;
    private readonly expirationDurationInMinutes: number;
    private nonce: string;
    private readonly props: any;
    private keyStore: JWK.KeyStore;

    constructor(
        kty: string = 'RSA',
        size: number = 2048,
        props: object = {alg: 'RS256', use: 'sig'},
        jwkFileName: string = 'keys.json'
    ) {
        this.kty = kty;
        this.size = size;
        this.props = props;
        this.jwkFileName = jwkFileName;
        this.keyStore = JWK.createKeyStore();
        // 1440 minutes === 24 hours
        this.expirationDurationInMinutes = 1440;
        this.nonce = '';
        this.createJwks();
    }

    // return nonce
    getNonce(): string {
        return this.nonce;
    }

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
    createJwks(): void {
        console.log('Creating JWKS store');
        // TODO better type hinting here gives issue
        let keyStorePromise: Promise<any> = null;
        if (existsSync('./ext_pk/auth0_jwk.json')) {
            console.log('Found external JWK file, loading it in store');
            const keyData = readFileSync('./ext_pk/auth0_jwk.json', {
                encoding: 'utf8',
                flag: 'r'
            });
            const keyJson = JSON.parse(keyData);
            keyStorePromise = JWK.asKeyStore([keyJson]).then((result: any) => {
                // {result} is a jose.JWK.KeyStore
                this.keyStore = result;
            });
        } else {
            console.log('Generate new JWKS store');
            keyStorePromise = this.keyStore.generate(this.kty, this.size, this.props);
        }

        keyStorePromise.then(() =>
            writeFileSync(
                this.jwkFileName,
                JSON.stringify(this.keyStore.toJSON(true), null, '  ')
            )
        );
    }

    // return key set
    getKeys(includePrivateKey: boolean = false, retType: string = '') {
        // getKeys(includePrivateKey: boolean = false, retType: string = ''): JWK.KeyStore {
        retType = retType.toLowerCase() || '';
        if (retType !== 'json' || !retType) {
            retType = 'json';
        }
        if (retType === 'json') {
            // return this.keyStore.toJSON(includePrivateKey) as JWK.KeyStore;
            return this.keyStore.toJSON(includePrivateKey);
        }
        return this.keyStore;
    }

    // TODO return type here needs to be defined better | giving issues with verify in api usage
    // create token with given payload & options
    async createToken(payload: IIdTokenClaims | IAccessTokenClaims, opt: object = {}) {// : Promise<JWS.CreateSignResult> {
        const key: JWK.Key = this.keyStore.all({use: 'sig'})[0];

        // default options if none passed in
        if (Object.keys(opt).length === 0) {
            opt = {compact: true, jwk: key, fields: {typ: 'jwt'}};
        }

        return await JWS.createSign(opt, key)
            .update(JSON.stringify(payload))
            .final();
    }

    async verify(token: string) {
        console.log('verify token');

        // Use first sig key
        const key: JWK.Key = this.keyStore.all({use: 'sig'})[0];
        const v: JWS.VerificationResult = await JWS.createVerify(this.keyStore).verify(token);

        console.log('token');
        console.log(token);
        console.log('Verify Token');
        console.log(v.header);
        console.log(v.payload.toString());

        // Verify Token with jsonwebtoken
        // TODO find way to get around this
        // @ts-ignore
        const publicKey: string = jwkToPem(key.toJSON());
        // TODO find way to get around this
        // @ts-ignore
        const privateKey: string = jwkToPem(key.toJSON(true), {private: true});

        console.log('public', publicKey);
        console.log('private', privateKey);

        const decoded = jwt.verify(token, publicKey);
        console.log('decoded', decoded);
    }
}

export const JwkWrapper = new JWKWrapper()
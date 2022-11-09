import jwkToBuffer from "jwk-to-pem";

export interface IAuthorize {
    redirect_uri: string
    prompt: string
    state: string
    client_id?: string
    nonce: string
    audience: string
}

export interface ILogin {
    redirect?: string
    state?: string
    username: string
    pw: string
}

export interface IUsers {
    username: string
    pw: string
    permissions: string[]
    scope: string
    given_name: string
    family_name: string
    nickname: string
    name: string
    email: string
    picture: string
}

export interface IIdTokenClaims {
    given_name: string
    family_name: string
    nickname: string
    name: string
    email: string
    picture: string
    iss: string
    sub: string
    aud: string[]
    iat: number
    exp: number
    amr: string[]
    nonce?: string
}

export interface IAccessTokenClaims {
    iss: string
    sub: string
    aud: string[]
    iat: number
    exp: number
    azp: string
    scope: string
    permissions: string[]
}

export interface ITokenDefault {
    domain: string
    sub: string
    defaultPermissions: string[]
    defaultScope: string
    aud: string[]
    given_name: string
    family_name: string
    nickname: string
    name: string
    email: string
    picture: string
    amr: string[]
}

export const AuthorizedDefaults: IAuthorize = {
    redirect_uri: "",
    prompt: "",
    state: "",
    client_id: "",
    nonce: "",
    audience: "",
};

export const UsersDefaults: IUsers = {
    username: "",
    pw: "",
    permissions: [""],
    scope: "",
    given_name: "",
    family_name: "",
    nickname: "",
    name: "",
    email: "",
    picture: "",
};

export const LoginDefaults: ILogin = {
    redirect: "",
    state: "",
    username: "",
    pw: "",
};

export interface IKeyList {
    keys: jwkToBuffer.JWK[]
}

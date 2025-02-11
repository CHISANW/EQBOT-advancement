import { Response, CookieOptions } from 'express';

// cookie
const defaultCookieOptions: CookieOptions = {
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1시간
    path: '/',
    sameSite: 'none',
    secure: true,
    domain: '.eqbr.com',
    expires: undefined,
};

export function setCookie (
    res: Response,
    name: string,
    value: any,
    option?: CookieOptions,
) {
    const options: CookieOptions = {
        ...defaultCookieOptions,
        ...option,
    };

    res.cookie(name, value, options);
}

export function deleteCookie (res: any, name: string, option?: CookieOptions) {
    const options: CookieOptions = {
        ...defaultCookieOptions,
        ...option,
    };

    res.clearCookie(name, options);
}

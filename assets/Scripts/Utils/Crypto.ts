import { AES, enc, mode, pad } from "./crypto/crypto-ts";
/** 加密 */
export const getEncrypt = (info: any, secret: string) => {
    let encrypted = AES.encrypt(JSON.stringify(info), secret).toString();
    return encrypted
};
/** 解密 */
export const getDecrypt = (cipherText: string, secret: string) => {
    const aes = AES.decrypt(cipherText, enc.Utf8.parse(secret), {
        iv: enc.Utf8.parse(secret),
        padding: pad.NoPadding,
        mode: mode.CBC
    }).toString(enc.Utf8)
    return JSON.parse(aes.replace(/\x00/g, ''))
};
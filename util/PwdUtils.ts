import * as crypto from 'crypto';

export class PwdUtils {
    private static iterations: number = 10;
    // This could have been improved with asyn methods, but I'm in a hurry
    static hashPwd (password: string): { salt: string, hash: string, iterations: number } {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, PwdUtils.iterations, 64, 'sha512').toString('hex');

        return {
            salt: salt,
            hash: hash,
            iterations: PwdUtils.iterations
        };
    }

    static validatePwd (password: string, salt: string, hash: string, iterations: number): boolean {
        const computedHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
        return computedHash === hash;
    }
}

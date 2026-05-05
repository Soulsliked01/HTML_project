/**
 * Fake token utilities (no real cryptography — base64 only).
 * Token = base64(username)
 */

export function generateFakeToken(username: string): string {
    return Buffer.from(username).toString('base64');
}

export function validateFakeToken(token: string): string | null {
    if (!token || token.trim() === '') return null;

    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        if (Buffer.from(decoded).toString('base64') !== token) return null;
        return decoded || null;
    } catch {
        return null;
    }
}
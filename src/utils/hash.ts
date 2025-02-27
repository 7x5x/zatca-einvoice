import * as crypto from 'crypto';

export class ZATCAHashing {
    // Returns the content as:
    // - hash - SHA256 digest (bytes)
    // - hexdigest - SHA256 digest (hex)
    // - base64 - SHA256 digest (bytes) then Base64 encoded
    // - hexdigest_base64 - SHA256 digest (hex) then Base64 encoded
    static generateHashes(content: string): { base64: string, hexdigest_base64: string, hexdigest: string, hash: Buffer } {
        // Create SHA256 hash of the content
        const sha256 = crypto.createHash('sha256').update(content).digest();
        const sha256Hex = sha256.toString('hex');

        return {
            base64: sha256.toString('base64'),
            hexdigest_base64: Buffer.from(sha256Hex, 'hex').toString('base64'),
            hexdigest: sha256Hex,
            hash: sha256
        };
    }
}

 


import { execSync } from 'child_process';
import fs from 'fs';
import { ZATCAHashing } from '../../utils/hash';


export class SigningCertificate {
    serial_number: string | null = null;
    issuer_name: string | null = null;
    cert_content_without_headers: string | null = null;
    hash: string | null = null;
    public_key: string | null = null;
    public_key_without_headers: string | null = null;
    signature: string | null = null;
    public_key_bytes: Buffer | null = null;

    private openssl_certificate: Buffer;

    constructor(certificatePath: string) {
        const certificate = fs.readFileSync(certificatePath);
        this.openssl_certificate = certificate;
        this.parse_certificate();
    }

    // Generates the certificate's hash with SHA256 and Base64 encoding
    static generate_base64_hash(base64_certificate: string): string {
        return ZATCAHashing.generateHashes(base64_certificate).hexdigest_base64;

    }

    private parse_certificate() {
        const pemContent = this.openssl_certificate.toString();
        this.cert_content_without_headers = pemContent
            .replace('-----BEGIN CERTIFICATE-----', '')
            .replace('-----END CERTIFICATE-----', '')
            .replace(/\n/g, '');

        this.hash = SigningCertificate.generate_base64_hash(this.cert_content_without_headers);

        // Extracting the issuer name and adding spaces after commas
        const issuerMatch = this.openssl_certificate.toString('utf-8').match(/issuer=([^$]+)/);
        if (issuerMatch) {
            this.issuer_name = issuerMatch[1].replace(/,/g, ', ');
        }

        // Extracting the serial number
        this.serial_number = this.get_serial_number();

        // Extracting the public key in PEM format
        this.public_key = this.get_public_key();

        // Removing the public key headers
        this.public_key_without_headers = this.public_key
            ?.replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/\n/g, '');

        // Extracting public key bytes (DER format)
        this.public_key_bytes = this.get_public_key_bytes();

        // Parsing the signature (not directly supported by crypto, using OpenSSL)
        this.signature = this.parse_signature();
    }

    private get_serial_number(): string {
        const serialNumberCmd = `openssl x509 -in ${this.openssl_certificate.toString()} -noout -serial`;
        const serialNumberOutput = execSync(serialNumberCmd).toString();
        return serialNumberOutput.split('=')[1].trim();
    }

    private get_public_key(): string {
        const publicKeyCmd = `openssl x509 -in ${this.openssl_certificate.toString()} -noout -pubkey`;
        return execSync(publicKeyCmd).toString();
    }

    private get_public_key_bytes(): Buffer {
        const publicKeyDerCmd = `openssl x509 -in ${this.openssl_certificate.toString()} -noout -pubkey -outform DER`;
        const publicKeyDer = execSync(publicKeyDerCmd);
        return publicKeyDer;
    }

    private parse_signature(): string | null {
        const der = this.openssl_certificate.toString('binary');
        const asn1Cmd = `openssl asn1parse -inform DER -in <(echo "${der}")`;
        try {
            const result = execSync(asn1Cmd).toString();
            const signatureMatch = result.match(/signature=([0-9A-Fa-f]+)$/);
            if (signatureMatch) {
                return signatureMatch[1];
            }
        } catch (error) {
            console.error('Error parsing signature:', error);
            return null;
        }
        return null;
    }
}


// Usage Example:
const certificatePath = './path_to_certificate.pem';
const certificate = new SigningCertificate(certificatePath);

console.log(certificate.serial_number);
console.log(certificate.issuer_name);
console.log(certificate.hash);
console.log(certificate.public_key);
console.log(certificate.signature);

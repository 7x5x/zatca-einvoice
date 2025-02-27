import * as crypto from 'crypto';
import * as fs from 'fs';
import { execSync } from 'child_process';

export enum IInvoiceType {
    Simplified = '0100',
    Standerd = '1000',
    Mixed = '1100'
}
export enum ZatcaEnvironmentMode {
    production = 'ZATCA-Code-Signing',
    simulation = 'PREZATCA-Code-Signing',
    sandbox = 'TSTZATCA-Code-Signing'
}

 

interface CSRGenerateOptions {
    commonName: string;
    organizationIdentifier: string;
    organizationName: string;
    organizationUnit: string;
    country: string;
    invoiceType: IInvoiceType;
    address: string;
    businessCategory: string;
    egsSolutionName: string;
    egsModel: string;
    egsSerialNumber: string;
}

class ZATCASigningCSR {
    private key: crypto.KeyObject | null = null;
    private csrOptions: CSRGenerateOptions;
    private mode: ZatcaEnvironmentMode;
    private privateKeyPath?: string;
    private privateKeyPassword?: string;
    private generatedPrivateKeyPath?: string;
    private csrConfigPath?: string;

    constructor(
        csrOptions: CSRGenerateOptions,
        mode: ZatcaEnvironmentMode,
        privateKeyPath?: string,
        privateKeyPassword?: string
    ) {
        this.csrOptions = { ...this.defaultCsrOptions(), ...csrOptions };
        this.mode = mode;
        this.privateKeyPath = privateKeyPath;
        this.privateKeyPassword = privateKeyPassword;
    }

    // Generate CSR and return the output
    public generate(): string {
        this.setKey();
        this.writeCsrConfig();

        const command = this.generateOpenSslCsrCommand();

        try {
            const output = execSync(command).toString();
            this.cleanupLeftoverFiles();
            return output;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error executing OpenSSL command: ${error.message}`);
            } else {
                throw new Error('Error executing OpenSSL command');
            }
        }
    }

    static generateCSR(csrOptions: CSRGenerateOptions, mode: ZatcaEnvironmentMode): string {
        return new ZATCASigningCSR(csrOptions, mode).generate();
    }
    private defaultCsrOptions(): CSRGenerateOptions {
        return {
            commonName: '',
            organizationIdentifier: '',
            organizationName: '',
            organizationUnit: '',
            country: 'SA',
            invoiceType: IInvoiceType.Mixed,
            address: '',
            businessCategory: '',
            egsSolutionName: '',
            egsModel: '',
            egsSerialNumber: ''
        };
    }

    private setKey(): void {
        if (this.privateKeyProvided() && !this.key) {
            this.key = crypto.createPrivateKey({
                key: fs.readFileSync(this.privateKeyPath as string),
                passphrase: this.privateKeyPassword
            });
        } else {
            this.generateKey();
        }
    }

    private privateKeyProvided(): boolean {
        return this.privateKeyPath !== undefined && this.privateKeyPath !== null;
    }

    private generateKey(): void {
        if (!this.privateKeyProvided()) {
            const tempKey = crypto.generateKeyPairSync('ec', {
                namedCurve: 'secp256k1'
            }).privateKey;
            this.generatedPrivateKeyPath = `./${crypto.randomUUID()}.pem`;
            this.key = tempKey;
            fs.writeFileSync(this.generatedPrivateKeyPath, tempKey.export({ type: 'pkcs8', format: 'pem' }));
        }
    }

    private deleteGeneratedKey(): void {
        if (this.generatedPrivateKeyPath) {
            fs.unlinkSync(this.generatedPrivateKeyPath);
        }
    }



    private generateOpenSslCsrCommand(): string {
        return `openssl req -new -sha256 -key ${this.privateKeyPath || this.generatedPrivateKeyPath} -config ${this.csrConfigPath}`;
    }

    private writeCsrConfig(): void {
        this.csrConfigPath = `./${crypto.randomUUID()}.conf`;
        fs.writeFileSync(this.csrConfigPath, this.generateCsrConfig());
    }

    private cleanupLeftoverFiles(): void {
        this.deleteGeneratedKey();
        this.deleteCsrConfigFile();
    }

    private deleteCsrConfigFile(): void {
        if (this.csrConfigPath) {
            fs.unlinkSync(this.csrConfigPath);
        }
    }

    private egsSerialNumber(): string {
        return `1-${this.csrOptions.egsSolutionName}|2-${this.csrOptions.egsModel}|3-${this.csrOptions.egsSerialNumber}`;
    }

    private generateCsrConfig(): string {
        return `
      # ------------------------------------------------------------------
      # Default section for "req" command csr_options
      # ------------------------------------------------------------------
      [req]

      prompt = no
      utf8 = no
      distinguished_name = my_req_dn_prompt
      req_extensions = v3_req

      [ v3_req ]
      1.3.6.1.4.1.311.20.2 = ASN1:PRINTABLESTRING:${this.mode}
      subjectAltName=dirName:dir_sect

      [ dir_sect ]
      SN = ${this.egsSerialNumber()}
      UID = ${this.csrOptions.organizationIdentifier}
      title = ${this.csrOptions.invoiceType}
      registeredAddress = ${this.csrOptions.address}
      businessCategory = ${this.csrOptions.businessCategory}

      [my_req_dn_prompt]
      commonName = ${this.csrOptions.commonName}
      organizationalUnitName = ${this.csrOptions.organizationUnit}
      organizationName = ${this.csrOptions.organizationName}
      countryName = ${this.csrOptions.country}
    `;
    }
}

export { ZATCASigningCSR, CSRGenerateOptions };


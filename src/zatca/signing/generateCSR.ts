import * as crypto from 'crypto';
import * as fs from 'fs';
import { execSync, spawnSync } from 'child_process';
import { EGSUnitInfo, EGSUnitLocation } from '../../types/EGSUnitInfo.interface';
import { logger } from '../../utils/logger';
import { handleError as handleErrorLogs } from '../../utils/handleError';
import { ZatcaEnvironmentMode } from '../../types/EZatcaEnvironment';

export enum IInvoiceType {
    Simplified = '0100',
    Standard = '1000',
    Mixed = '1100'
}





class ZATCASigningCSR {
    private csrOptions: EGSUnitInfo;
    private key: crypto.KeyObject | null = null;
    private mode: ZatcaEnvironmentMode; // Default to production
    private privateKeyPath?: string;
    private privateKeyPassword?: string;
    private generatedPrivateKeyPath?: string;
    private csrConfigPath?: string;

    constructor(
        csrOptions: EGSUnitInfo,
        mode: ZatcaEnvironmentMode = ZatcaEnvironmentMode.Production, // Make `mode` optional
        privateKeyPath?: string,
        privateKeyPassword?: string
    ) {
        this.csrOptions = { ...this.defaultCsrOptions(), ...csrOptions };
        this.mode = mode;
        this.privateKeyPath = privateKeyPath;
        this.privateKeyPassword = privateKeyPassword;
    }

    // Generate CSR and return the output
    public generate() {
        this.setKey();
        this.writeCsrConfig();
        const privateKey = this.key.export({ type: 'pkcs8', format: 'pem' }).toString();
        const command = this.generateOpenSslCsrCommand();

        try {
            const csr = spawnSync('openssl', command, {
                input: privateKey,
                encoding: 'utf-8'
            }).stdout;

            this.cleanupLeftoverFiles();
            logger("generate csr", "info", "CSR generated successfully.");
            return { privateKey, csr };
        } catch (error) {
            logger("generate csr", "error", `Error generateing csr  `);
            return { privateKey: null, csr: null };
        }
    }

    static generateCSR(csrOptions: EGSUnitInfo, mode: ZatcaEnvironmentMode) {
        return new ZATCASigningCSR(csrOptions, mode).generate();
    }
    private defaultCsrOptions(): EGSUnitInfo {
        return {
            commonName: '',
            organizationIdentifier: '',
            organizationName: '',
            organizationUnit: '',
            country: 'SA',
            invoiceType: IInvoiceType.Mixed,
            location: {} as EGSUnitLocation,
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
            this.key = crypto.generateKeyPairSync('ec', {
                namedCurve: 'secp256k1'
            }).privateKey;
            // this.generatedPrivateKeyPath = `./${crypto.randomUUID()}.pem`;
            // this.key = tempKey;
            // fs.writeFileSync(this.generatedPrivateKeyPath, tempKey.export({ type: 'pkcs8', format: 'pem' }));
        }
    }

    private deleteGeneratedKey(): void {
        if (this.generatedPrivateKeyPath) {
            fs.unlinkSync(this.generatedPrivateKeyPath);
        }
    }



    private generateOpenSslCsrCommand(): string[] {
        return ['req', '-new', '-sha256', '-key', '/dev/stdin', '-config', this.csrConfigPath as string];
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
      registeredAddress = ${this.csrOptions.location.building} ${this.csrOptions.location.street} ${this.csrOptions.location.city}
      businessCategory = ${this.csrOptions.businessCategory}

      [my_req_dn_prompt]
      commonName = ${this.csrOptions.commonName}
      organizationalUnitName = ${this.csrOptions.organizationUnit}
      organizationName = ${this.csrOptions.organizationName}
      countryName = ${this.csrOptions.country}
    `;
    }
}

export { ZATCASigningCSR, EGSUnitInfo as CSRGenerateOptions };



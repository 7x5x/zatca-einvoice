import * as crypto from 'crypto';
import * as fs from 'fs';
import { execSync, spawn, spawnSync } from 'child_process';
import { EGSUnitInfo, EGSUnitLocation } from '../../types/EGSUnitInfo.interface';
import { logger } from '../../utils/logger';
import { handleError as handleErrorLogs } from '../../utils/handleError';
import { ZatcaEnvironmentMode } from '../../types/EZatcaEnvironment';
import { error } from 'console';

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
            const output = execSync(command).toString(); 
            const csr = Buffer.from(output).toString("base64")
            this.cleanupLeftoverFiles();

            
            logger("generate csr", "info", "CSR generated successfully.");
            return { privateKey, csr };
        } catch (error) {
            logger("generate csr", "error", `Error generateing csr  `);
            throw error
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
# Default section for "req" command options
# ------------------------------------------------------------------
oid_section = OIDs
[OIDs]
certificateTemplateName = 1.3.6.1.4.1.311.20.2

[req]

# Password for reading in existing private key file
# input_password = SET_PRIVATE_KEY_PASS

# Prompt for DN field values and CSR attributes in ASCII
prompt = no
default_bits = 2048
emailAddress = info@nassaco.com
req_extensions = v3_req
default_md = sha 256
req_extensions = req_ext
distinguished_name = dn


# Section pointer for DN field options
distinguished_name = my_req_dn_prompt

# Extensions
req_extensions = v3_req

[ v3_req ]
#basicConstraints=CA:FALSE
#keyUsage = digitalSignature, keyEncipherment
# Production or Testing Template (TSTZATCA-Code-Signing - ZATCA-Code-Signing)
1.3.6.1.4.1.311.20.2 = ASN1:PRINTABLESTRING:${this.mode}
subjectAltName=dirName:dir_sect

[ dir_sect ]
# EGS Serial number (1-SolutionName|2-ModelOrVersion|3-serialNumber)
SN = ${this.egsSerialNumber()}
# VAT Registration number of TaxPayer (Organization identifier [15 digits begins with 3 and ends with 3])
UID = ${this.csrOptions.organizationIdentifier}
# Invoice type (TSCZ)(1 = supported, 0 not supported) (Tax, Simplified, future use, future use)
title = ${this.csrOptions.invoiceType}
# Location (branch address or website)
registeredAddress = ${this.csrOptions.location.building} ${this.csrOptions.location.street}, ${this.csrOptions.location.city}
# Industry (industry sector name)
businessCategory = ${this.csrOptions.businessCategory}

# ------------------------------------------------------------------
# Section for prompting DN field values to create "subject"
# ------------------------------------------------------------------
[my_req_dn_prompt]
# Common name (EGS TaxPayer PROVIDED ID [FREE TEXT])
commonName = ${this.csrOptions.commonName}

# Organization Unit (Branch name)
organizationalUnitName = ${this.csrOptions.organizationUnit}

# Organization name (Tax payer name)
organizationName = ${this.csrOptions.organizationName}

# ISO2 country code is required with US as default
countryName = ${this.csrOptions.country}
`;
    }
}

export { ZATCASigningCSR, EGSUnitInfo as CSRGenerateOptions };




import { ZATCATaxInvoice } from "../zatca/templates/ZATCATaxInvoice";
import { throwErrorObject } from "../utils/errorType";

export class SignInvoiceService {
    private private_key: string;
    private certificate: string;

    constructor(private_key: string, certificate: string) {
        
        if (!certificate || certificate.length === 0 || !private_key || private_key.length === 0)
            throwErrorObject({
                message: "EGS is missing a certificate/private key to sign the invoice.",
            });

        this.private_key = private_key;
        this.certificate = certificate;
    }

    signInvoice(
        invoice: ZATCATaxInvoice,
    ): { signed_invoice_string: string; invoice_hash: string; qr: string } {

        if (!this.certificate || !this.private_key)
            throwErrorObject({
                message:
                    "EGS is missing a certificate/private key to sign the invoice.",
            });

        return invoice.sign(this.certificate, this.private_key);
    }
}

import { ZATCATaxInvoice } from "../zatca/templates/ZATCATaxInvoice";
import { throwErrorObject } from "../utils/errorType";

export class SignInvoiceService {
    private private_key: string;
    private certificate: string;

    constructor(private_key: string, certificate: string) {
        // Validate the inputs during instantiation
        if (!certificate || certificate.length === 0 || !private_key || private_key.length === 0) {
            throwErrorObject({
                message: "EGS is missing a certificate/private key to sign the invoice.",
            });
        }

        this.private_key = private_key;
        this.certificate = certificate;
    }

    /**
     * Signs the provided invoice using the private key and certificate.
     * @param invoice The invoice to be signed.
     * @returns { signed_invoice_string, invoice_hash, qr } Signed data
     */
    signInvoice(invoice: ZATCATaxInvoice): { signed_invoice_string: string; invoice_hash: string; qr: string } {
        // Assuming `invoice.sign` method exists and works as expected
        return invoice.sign(this.certificate, this.private_key);
    }
}

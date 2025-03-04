 /* Removes header and footer from certificate string.*/
export const cleanUpCertificateString = (
    certificate_string: string
): string => {
    return certificate_string
        .replace(`-----BEGIN CERTIFICATE-----\n`, "")
        .replace("-----END CERTIFICATE-----", "")
        .trim();
};
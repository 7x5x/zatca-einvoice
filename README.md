# ZATCA E-Invoice Integration

This project provides a TypeScript-based toolkit for integrating with the ZATCA (Saudi Arabia Tax and Customs Authority) e-invoicing API. It supports onboarding, invoice generation, signing, and submission for both standard and simplified invoices.

## Features

- Onboard EGS units and manage CSIDs
- Generate and sign ZATCA-compliant invoices (Standard & Simplified)
- Submit invoices for clearance and reporting
- Modular, extensible architecture

## Project Structure

```
src/
  index.ts            # Entry point example
  clients/            # ZATCA API client
  egs/                # EGS onboarding services
  invoice/            # Invoice sender abstractions
  seed/               # Example/test invoice data
  services/           # Business logic services
  types/              # Shared TypeScript types
  utils/              # Utilities (logging, error handling, XML, etc.)
  zatca/              # ZATCA-specific logic (signing, QR, templates)
test/
  invoices.ts         # Test/demo scripts
logs/
  invoice.log         # Log file
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- pnpm or npm

### Installation

```sh
pnpm install
# or
npm install
```

### Build

```sh
pnpm run build
# or
npm run build
```

### Usage Example

See [src/index.ts](src/index.ts) for a full example. Basic onboarding and invoice flow:

```typescript
import { ZatcaClient } from "./src/clients/ZatcaClient";
import { EgsOnboardingService } from "./src/egs/EgsOnboardingService";
import { ZatcaEnvironmentUrl } from "./src/types/EZatcaEnvironment";
import { CSRGenerateOptions, IInvoiceType } from "./src/zatca/signing/generateCSR";

const csrOptions: CSRGenerateOptions = {
  // ...fill with your EGS unit info
};

const zatcaClient = new ZatcaClient(ZatcaEnvironmentUrl.Sandbox, "en", "V2");
const onboardingService = new EgsOnboardingService(csrOptions, zatcaClient);

// Onboard and get CSID
onboardingService.onboard('YOUR_OTP_HERE').then((csid) => {
  console.log('Production CSID:', csid);
});
```

### Invoice Generation & Signing

See [src/seed/testStandard.ts](src/seed/testStandard.ts) and [src/seed/testSimplified.ts](src/seed/testSimplified.ts) for examples of generating test invoices.

## Logging

Logs are written to `logs/invoice.log`. Enable logging by setting `LOGGING=1` in your `.env` file.

## Customization

- Extend invoice templates in [src/zatca/templates/](src/zatca/templates/)
- Add new invoice types by implementing [`IInvoiceSender`](src/invoice/IInvoiceSender.ts)

## License

ISC

---

**Author:** Ali Al-Gabal
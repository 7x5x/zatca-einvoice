import fs from "fs";
export function saveInvoice(text: string, xmlFile:any) {
  const invoice = Buffer.from(xmlFile, "base64").toString();
  let filename = "";
  const charsToRemove = "-:";
  for (const char of text) {
    if (!charsToRemove.includes(char)) {
      filename += char;
    }
  }

  const filePath = `invoices/${filename}`;

  fs.writeFile(filePath, invoice, (err) => {
    if (err) {
      // console.error(err);
    } else {
      // console.log("Successfully wrote data to file!");
    }
  });
}

/**
 * Security credential encryption utility.
 * Used for B2B, B2C, account balance, and reversal operations.
 * Server-only.
 * @author lucysees
 */

import crypto from "crypto";
import path from "path";
import fs from "fs";

/**
 * Encrypts a plain-text initiator password using the Safaricom public certificate.
 *
 * @param password  - Your M-Pesa initiator password (plain text)
 * @param certPath  - Absolute path to the Safaricom certificate (.cer / .pem).
 *                    Defaults to `<cwd>/certs/ProductionCertificate.cer`.
 */
export function encryptSecurityCredential(
  password: string,
  certPath?: string
): string {
  const resolvedCertPath =
    certPath ??
    path.resolve(process.cwd(), "certs", "ProductionCertificate.cer");

  if (!fs.existsSync(resolvedCertPath)) {
    throw new Error(
      `Safaricom certificate not found at: ${resolvedCertPath}. ` +
        "Place the certificate file in the /certs directory."
    );
  }

  const publicKey = fs.readFileSync(resolvedCertPath, "utf8");
  const buffer = Buffer.from(password, "utf8");

  const encrypted = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    buffer
  );

  return encrypted.toString("base64");
}

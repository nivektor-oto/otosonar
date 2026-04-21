import { TOTP, Secret } from "otpauth";

export function generateSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export function buildTotp(secret: string, label: string): TOTP {
  return new TOTP({
    issuer: "OtoSonar",
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });
}

export function getOtpAuthUri(secret: string, email: string): string {
  return buildTotp(secret, email).toString();
}

export function verifyCode(secret: string, code: string): boolean {
  const totp = buildTotp(secret, "verify");
  const delta = totp.validate({ token: code.replace(/\s/g, ""), window: 1 });
  return delta !== null;
}

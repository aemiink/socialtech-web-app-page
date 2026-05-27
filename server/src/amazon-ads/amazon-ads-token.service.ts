import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

@Injectable()
export class AmazonAdsTokenService {
  constructor(private readonly configService: ConfigService) {}

  encrypt(token: string): string {
    const key = this.getKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
  }

  decrypt(payload: string): string {
    const key = this.getKey();
    const [ivBase64, tagBase64, encryptedBase64] = payload.split(":");
    if (!ivBase64 || !tagBase64 || !encryptedBase64) {
      throw new InternalServerErrorException("Stored Amazon Ads token is invalid.");
    }

    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivBase64, "base64"));
    decipher.setAuthTag(Buffer.from(tagBase64, "base64"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedBase64, "base64")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }

  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private getKey(): Buffer {
    const secret =
      process.env.AMAZON_ADS_TOKEN_ENCRYPTION_KEY ??
      this.configService.get<string>("AMAZON_ADS_TOKEN_ENCRYPTION_KEY");

    if (!secret || secret.trim().length < 32) {
      throw new InternalServerErrorException(
        "AMAZON_ADS_TOKEN_ENCRYPTION_KEY must be configured to store Amazon Ads credentials.",
      );
    }

    return createHash("sha256").update(secret).digest();
  }
}

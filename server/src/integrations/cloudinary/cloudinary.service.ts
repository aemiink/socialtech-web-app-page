import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";

type SignatureParams = {
  timestamp: number;
  publicId: string;
  overwrite?: boolean;
};

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {}

  createUploadSignature(params: SignatureParams) {
    const cloudName = this.getRequired("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.getRequired("CLOUDINARY_API_KEY");
    const apiSecret = this.getRequired("CLOUDINARY_API_SECRET");

    const signaturePayload = [
      `public_id=${params.publicId}`,
      `timestamp=${params.timestamp}`,
      ...(params.overwrite ? ["overwrite=true"] : []),
    ].join("&");
    const signature = createHash("sha1").update(`${signaturePayload}${apiSecret}`).digest("hex");

    return {
      cloudName,
      apiKey,
      timestamp: params.timestamp,
      publicId: params.publicId,
      signature,
    };
  }

  async deleteAsset(publicId: string, resourceType = "raw"): Promise<void> {
    const cloudName = this.getRequired("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.getRequired("CLOUDINARY_API_KEY");
    const apiSecret = this.getRequired("CLOUDINARY_API_SECRET");
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
    const formData = new URLSearchParams();
    formData.set("public_id", publicId);
    formData.set("timestamp", String(timestamp));
    formData.set("api_key", apiKey);
    formData.set("signature", signature);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new InternalServerErrorException("Cloudinary delete request failed.");
    }

    const json = (await response.json()) as { result?: string; error?: { message?: string } };
    if (json.error?.message) {
      throw new InternalServerErrorException(json.error.message);
    }
    if (json.result !== "ok" && json.result !== "not found") {
      throw new BadRequestException("Cloudinary asset could not be deleted.");
    }
  }

  private getRequired(key: string): string {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      throw new InternalServerErrorException(`${key} is not configured.`);
    }

    return value;
  }
}


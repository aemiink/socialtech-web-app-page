import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { ClientTicketStatus, PurchasedServiceKey } from "@prisma/client";

export class ListClientTicketsDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsEnum(PurchasedServiceKey)
  serviceKey?: PurchasedServiceKey;

  @IsOptional()
  @IsEnum(ClientTicketStatus)
  status?: ClientTicketStatus;
}

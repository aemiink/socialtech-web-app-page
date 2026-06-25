import { IsEnum, IsOptional } from "class-validator";
import { ClientTicketStatus, Priority } from "@prisma/client";

export class UpdateClientTicketDto {
  @IsOptional()
  @IsEnum(ClientTicketStatus)
  status?: ClientTicketStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}

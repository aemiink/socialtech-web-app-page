import { Injectable, NotImplementedException } from "@nestjs/common";

@Injectable()
export class ClientsService {
  getSkeletonInfo(): never {
    throw new NotImplementedException("Clients module is scaffolded but not implemented yet.");
  }
}

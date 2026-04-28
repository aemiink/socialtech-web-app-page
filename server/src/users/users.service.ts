import { Injectable, NotImplementedException } from "@nestjs/common";

@Injectable()
export class UsersService {
  getSkeletonInfo(): never {
    throw new NotImplementedException("Users module is scaffolded but not implemented yet.");
  }
}

import { Injectable, NotImplementedException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { LogoutDto } from "./dto/logout.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@Injectable()
export class AuthService {
  login(_payload: LoginDto): never {
    throw new NotImplementedException("Auth login flow is not implemented in foundation milestone.");
  }

  refresh(_payload: RefreshTokenDto): never {
    throw new NotImplementedException("Auth refresh flow is not implemented in foundation milestone.");
  }

  logout(_payload: LogoutDto): never {
    throw new NotImplementedException("Auth logout flow is not implemented in foundation milestone.");
  }

  me(): never {
    throw new NotImplementedException("Auth me flow is not implemented in foundation milestone.");
  }
}

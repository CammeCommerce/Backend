import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { AuthService } from "src/domain/auth/auth.service";

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    return this.authService.checkLogin();
  }
}

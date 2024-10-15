import { Module } from "@nestjs/common";
import { AuthService } from "src/domain/auth/auth.service";
import { LoginGuard } from "src/domain/auth/login.guard";

@Module({
  providers: [AuthService, LoginGuard],
  exports: [AuthService],
})
export class AuthModule {}

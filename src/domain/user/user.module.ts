import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "src/domain/user/controller/user.controller";
import { UserService } from "src/domain/user/service/user.service";
import { User } from "src/domain/user/entity/user.entity";
import { AuthModule } from "src/domain/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

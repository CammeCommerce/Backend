import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "src/domain/user/controller/user.controller";
import { UserService } from "src/domain/user/service/user.service";
import { User } from "src/domain/user/entity/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

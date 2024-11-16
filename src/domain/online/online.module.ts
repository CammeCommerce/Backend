import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Online } from "./entity/online.entity";
import { AuthModule } from "../auth/auth.module";
import { OnlineController } from "./controller/online.controller";
import { OnlineService } from "./service/online.service";

@Module({
  imports: [TypeOrmModule.forFeature([Online]), AuthModule],
  controllers: [OnlineController],
  providers: [OnlineService],
})
export class OnlineModule {}

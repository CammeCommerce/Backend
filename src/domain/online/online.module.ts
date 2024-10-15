import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Online } from "src/domain/online/entity/online.entity";
import { OnlineController } from "src/domain/online/controller/online.controller";
import { OnlineService } from "src/domain/online/service/online.service";
import { AuthModule } from "src/domain/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Online]), AuthModule],
  controllers: [OnlineController],
  providers: [OnlineService],
})
export class OnlineModule {}

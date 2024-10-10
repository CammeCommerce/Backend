import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediumController } from "src/domain/medium/controller/medium.controller";
import { MediumService } from "src/domain/medium/service/medium.service";
import { Medium } from "src/domain/medium/entity/medium.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Medium])],
  controllers: [MediumController],
  providers: [MediumService],
})
export class MediumModule {}

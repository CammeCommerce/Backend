import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepositMatching } from "./entity/deposit-matching.entity";
import { AuthModule } from "../auth/auth.module";
import { DepositMatchingController } from "./controller/deposit-matching.controller";
import { DepositMatchingService } from "./service/deposit-matching.service";

@Module({
  imports: [TypeOrmModule.forFeature([DepositMatching]), AuthModule],
  controllers: [DepositMatchingController],
  providers: [DepositMatchingService],
})
export class DepositMatchingModule {}

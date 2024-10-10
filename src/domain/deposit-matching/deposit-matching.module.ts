import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepositMatching } from "src/domain/deposit-matching/entity/deposit-matching.entity";
import { DepositMatchingController } from "src/domain/deposit-matching/controller/deposit-matching.controller";
import { DepositMatchingService } from "src/domain/deposit-matching/service/deposit-matching.service";

@Module({
  imports: [TypeOrmModule.forFeature([DepositMatching])],
  controllers: [DepositMatchingController],
  providers: [DepositMatchingService],
})
export class DepositMatchingModule {}

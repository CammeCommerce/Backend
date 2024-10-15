import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepositMatching } from "src/domain/deposit-matching/entity/deposit-matching.entity";
import { DepositMatchingController } from "src/domain/deposit-matching/controller/deposit-matching.controller";
import { DepositMatchingService } from "src/domain/deposit-matching/service/deposit-matching.service";
import { AuthModule } from "src/domain/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([DepositMatching]), AuthModule],
  controllers: [DepositMatchingController],
  providers: [DepositMatchingService],
})
export class DepositMatchingModule {}

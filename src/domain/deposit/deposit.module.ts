import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { DepositController } from "src/domain/deposit/controller/deposit.controller";
import { DepositService } from "src/domain/deposit/service/deposit.service";
import { DepositMatching } from "src/domain/deposit-matching/entity/deposit-matching.entity";
import { DepositColumnIndex } from "src/domain/deposit/entity/deposit-column-index.entity";
import { AuthModule } from "src/domain/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit, DepositMatching, DepositColumnIndex]),
    AuthModule,
  ],
  controllers: [DepositController],
  providers: [DepositService],
})
export class DepositModule {}

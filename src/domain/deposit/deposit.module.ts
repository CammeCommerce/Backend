import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Deposit } from "./entity/deposit.entity";
import { DepositMatching } from "../deposit-matching/entity/deposit-matching.entity";
import { DepositColumnIndex } from "./entity/deposit-column-index.entity";
import { AuthModule } from "../auth/auth.module";
import { DepositController } from "./controller/deposit.controller";
import { DepositService } from "./service/deposit.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit, DepositMatching, DepositColumnIndex]),
    AuthModule,
  ],
  controllers: [DepositController],
  providers: [DepositService],
})
export class DepositModule {}

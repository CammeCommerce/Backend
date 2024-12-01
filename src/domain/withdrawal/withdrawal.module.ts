import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Withdrawal } from "./entity/withdrawal.entity";
import { WithdrawalMatching } from "../withdrawal-matching/entity/withdrawal-matching.entity";
import { WithdrawalColumnIndex } from "./entity/withdrawal-column-index.entity";
import { AuthModule } from "../auth/auth.module";
import { WithdrawalController } from "./controller/withdrawal.controller";
import { WithdrawalService } from "./service/withdrawal.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Withdrawal,
      WithdrawalMatching,
      WithdrawalColumnIndex,
    ]),
    AuthModule,
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}

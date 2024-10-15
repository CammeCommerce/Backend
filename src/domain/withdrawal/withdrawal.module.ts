import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";
import { WithdrawalController } from "src/domain/withdrawal/controller/withdrawal.controller";
import { WithdrawalService } from "src/domain/withdrawal/service/withdrawal.service";
import { WithdrawalMatching } from "src/domain/withdrawal-matching/entity/withdrawal-matching.entity";
import { WithdrawalColumnIndex } from "src/domain/withdrawal/entity/withdrawal-column-index.entity";
import { AuthModule } from "src/domain/auth/auth.module";

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
})
export class WithdrawalModule {}

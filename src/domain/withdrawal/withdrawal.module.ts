import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";
import { WithdrawalController } from "src/domain/withdrawal/controller/withdrawal.controller";
import { WithdrawalService } from "src/domain/withdrawal/service/withdrawal.service";

@Module({
  imports: [TypeOrmModule.forFeature([Withdrawal])],
  controllers: [WithdrawalController],
  providers: [WithdrawalService],
})
export class WithdrawalModule {}

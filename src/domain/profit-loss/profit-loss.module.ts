import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfitLoss } from "src/domain/profit-loss/entity/profit-loss.entity";
import { ProfitLossController } from "src/domain/profit-loss/controller/profit-loss.controller";
import { ProfitLossService } from "src/domain/profit-loss/service/profit-loss.service";
import { Order } from "src/domain/order/entity/order.entity";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";
import { Online } from "src/domain/online/entity/online.entity";
import { AuthModule } from "src/domain/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfitLoss, Order, Deposit, Withdrawal, Online]),
    AuthModule,
  ],
  controllers: [ProfitLossController],
  providers: [ProfitLossService],
})
export class ProfitLossModule {}

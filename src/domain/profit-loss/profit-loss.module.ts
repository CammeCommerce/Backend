import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfitLoss } from "./entity/profit-loss.entity";
import { Order } from "../order/entity/order.entity";
import { Deposit } from "../deposit/entity/deposit.entity";
import { Withdrawal } from "../withdrawal/entity/withdrawal.entity";
import { Online } from "../online/entity/online.entity";
import { AuthModule } from "../auth/auth.module";
import { ProfitLossController } from "./controller/profit-loss.controller";
import { ProfitLossService } from "./service/profit-loss.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfitLoss, Order, Deposit, Withdrawal, Online]),
    AuthModule,
  ],
  controllers: [ProfitLossController],
  providers: [ProfitLossService],
})
export class ProfitLossModule {}

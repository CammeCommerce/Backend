import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Medium } from "./entity/medium.entity";
import { Order } from "../order/entity/order.entity";
import { Deposit } from "../deposit/entity/deposit.entity";
import { Withdrawal } from "../withdrawal/entity/withdrawal.entity";
import { AuthModule } from "../auth/auth.module";
import { MediumController } from "./controller/medium.controller";
import { MediumService } from "./service/medium.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Medium, Order, Deposit, Withdrawal]),
    AuthModule,
  ],
  controllers: [MediumController],
  providers: [MediumService],
})
export class MediumModule {}

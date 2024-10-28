import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediumController } from "src/domain/medium/controller/medium.controller";
import { MediumService } from "src/domain/medium/service/medium.service";
import { Medium } from "src/domain/medium/entity/medium.entity";
import { AuthModule } from "src/domain/auth/auth.module";
import { Order } from "src/domain/order/entity/order.entity";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Medium, Order, Deposit, Withdrawal]),
    AuthModule,
  ],
  controllers: [MediumController],
  providers: [MediumService],
})
export class MediumModule {}

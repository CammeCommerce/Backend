import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { DepositController } from "src/domain/deposit/controller/deposit.controller";
import { DepositService } from "src/domain/deposit/service/deposit.service";

@Module({
  imports: [TypeOrmModule.forFeature([Deposit])],
  controllers: [DepositController],
  providers: [DepositService],
})
export class DepositModule {}

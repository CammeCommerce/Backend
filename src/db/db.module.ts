import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../domain/user/entity/user.entity";
import { Medium } from "../domain/medium/entity/medium.entity";
import { SettlementCompany } from "../domain/settlement-company/entity/settlement-company.entity";
import { Order } from "../domain/order/entity/order.entity";
import { OrderMatching } from "../domain/order-matching/entity/order-matching.entity";
import { Deposit } from "../domain/deposit/entity/deposit.entity";
import { DepositMatching } from "../domain/deposit-matching/entity/deposit-matching.entity";
import { Withdrawal } from "../domain/withdrawal/entity/withdrawal.entity";
import { WithdrawalMatching } from "../domain/withdrawal-matching/entity/withdrawal-matching.entity";
import { Online } from "../domain/online/entity/online.entity";
import { ProfitLoss } from "../domain/profit-loss/entity/profit-loss.entity";
import { OrderColumnIndex } from "../domain/order/entity/order-column-index.entity";
import { DepositColumnIndex } from "../domain/deposit/entity/deposit-column-index.entity";
import { WithdrawalColumnIndex } from "../domain/withdrawal/entity/withdrawal-column-index.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("DB_HOST"),
        port: +configService.get("DB_PORT"),
        username: configService.get("DB_USER"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        entities: [
          User,
          Medium,
          SettlementCompany,
          Order,
          OrderMatching,
          Deposit,
          DepositMatching,
          Withdrawal,
          WithdrawalMatching,
          Online,
          ProfitLoss,
          OrderColumnIndex,
          DepositColumnIndex,
          WithdrawalColumnIndex,
        ],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DBModule {}

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepositMatching } from "src/domain/deposit-matching/entity/deposit-matching.entity";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { ProfitLoss } from "src/domain/profit-loss/entity/profit-loss.entity";
import { Medium } from "src/domain/medium/entity/medium.entity";
import { Online } from "src/domain/online/entity/online.entity";
import { OrderMatching } from "src/domain/order-matching/entity/order-matching.entity";
import { Order } from "src/domain/order/entity/order.entity";
import { SettlementCompany } from "src/domain/settlement-company/entity/settlement-company.entity";
import { User } from "src/domain/user/entity/user.entity";
import { WithdrawalMatching } from "src/domain/withdrawal-matching/entity/withdrawal-matching.entity";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";
import { OrderColumnIndex } from "src/domain/order/entity/order-column-index.entity";
import { DepositColumnIndex } from "src/domain/deposit/entity/deposit-column-index.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
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
        ],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DBModule {}

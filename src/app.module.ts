import { Module } from "@nestjs/common";
import { DBModule } from "./db/db.module";
import { UserModule } from "./domain/user/user.module";
import { MediumModule } from "./domain/medium/medium.module";
import { SettlementCompanyModule } from "./domain/settlement-company/settlement-company.module";
import { OrderModule } from "./domain/order/order.module";
import { OrderMatchingModule } from "./domain/order-matching/order-matching.module";
import { DepositModule } from "./domain/deposit/deposit.module";
import { DepositMatchingModule } from "./domain/deposit-matching/deposit-matching.module";
import { WithdrawalModule } from "./domain/withdrawal/withdrawal.module";
import { WithdrawalMatchingModule } from "./domain/withdrawal-matching/withdrawal-matching.module";
import { OnlineModule } from "./domain/online/online.module";
import { ProfitLossModule } from "./domain/profit-loss/profit-loss.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    DBModule,
    UserModule,
    MediumModule,
    SettlementCompanyModule,
    OrderModule,
    OrderMatchingModule,
    DepositModule,
    DepositMatchingModule,
    WithdrawalModule,
    WithdrawalMatchingModule,
    OnlineModule,
    ProfitLossModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

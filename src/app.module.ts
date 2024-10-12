import { Module } from "@nestjs/common";
import { AppController } from "src/app.controller";
import { AppService } from "src/app.service";
import { UserModule } from "src/domain/user/user.module";
import { MediumModule } from "src/domain/medium/medium.module";
import { SettlementCompanyModule } from "src/domain/settlement-company/settlement-company.module";
import { OrderModule } from "src/domain/order/order.module";
import { OrderMatchingModule } from "src/domain/order-matching/order-matching.module";
import { DepositModule } from "src/domain/deposit/deposit.module";
import { DepositMatchingModule } from "src/domain/deposit-matching/deposit-matching.module";
import { WithdrawalModule } from "src/domain/withdrawal/withdrawal.module";
import { WithdrawalMatchingModule } from "src/domain/withdrawal-matching/withdrawal-matching.module";
import { OnlineModule } from "src/domain/online/online.module";
import { ProfitLossModule } from "src/domain/profit-loss/profit-loss.module";
import { DBModule } from "src/db/db.module";

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

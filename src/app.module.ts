import { Module } from "@nestjs/common";
import { AppController } from "src/app.controller";
import { AppService } from "src/app.service";
import { UserModule } from "src/domain/user/user.module";
import { MediumModule } from "src/domain/medium/medium.module";
import { SettlementCompanyModule } from "src/domain/settlement-company/settlement-company.module";
import { OrderModule } from "src/domain/order/order.module";
import { OrderMatchingModule } from "src/domain/order-matching/order-matching.module";

@Module({
  imports: [
    UserModule,
    MediumModule,
    SettlementCompanyModule,
    OrderModule,
    OrderMatchingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

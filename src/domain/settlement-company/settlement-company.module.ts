import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettlementCompany } from "./entity/settlement-company.entity";
import { Order } from "../order/entity/order.entity";
import { AuthModule } from "../auth/auth.module";
import { SettlementCompanyController } from "./controller/settlement-company.controller";
import { SettlementCompanyService } from "./service/settlement-company.service";

@Module({
  imports: [TypeOrmModule.forFeature([SettlementCompany, Order]), AuthModule],
  controllers: [SettlementCompanyController],
  providers: [SettlementCompanyService],
})
export class SettlementCompanyModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettlementCompany } from "src/domain/settlement-company/entity/settlement-company.entity";
import { SettlementCompanyController } from "src/domain/settlement-company/controller/settlement-company.controller";
import { SettlementCompanyService } from "src/domain/settlement-company/service/settlement-company.service";
import { AuthModule } from "src/domain/auth/auth.module";
import { Order } from "src/domain/order/entity/order.entity";

@Module({
  imports: [TypeOrmModule.forFeature([SettlementCompany, Order]), AuthModule],
  controllers: [SettlementCompanyController],
  providers: [SettlementCompanyService],
})
export class SettlementCompanyModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettlementCompany } from "src/domain/settlement-company/entity/settlement-company.entity";
import { SettlementCompanyController } from "src/domain/settlement-company/controller/settlement-company.controller";
import { SettlementCompanyService } from "src/domain/settlement-company/service/settlement-company.service";

@Module({
  imports: [TypeOrmModule.forFeature([SettlementCompany])],
  controllers: [SettlementCompanyController],
  providers: [SettlementCompanyService],
})
export class SettlementCompanyModule {}

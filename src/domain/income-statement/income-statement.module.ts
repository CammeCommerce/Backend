import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IncomeStatement } from "src/domain/income-statement/entity/income-statement.entity";
import { IncomeStatementController } from "src/domain/income-statement/controller/income-statement.controller";
import { IncomeStatementService } from "src/domain/income-statement/service/income-statement.service";

@Module({
  imports: [TypeOrmModule.forFeature([IncomeStatement])],
  controllers: [IncomeStatementController],
  providers: [IncomeStatementService],
})
export class IncomeStatementModule {}

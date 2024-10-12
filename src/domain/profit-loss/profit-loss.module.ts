import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfitLoss } from "src/domain/profit-loss/entity/profit-loss.entity";
import { ProfitLossController } from "src/domain/profit-loss/controller/profit-loss.controller";
import { ProfitLossService } from "src/domain/profit-loss/service/profit-loss.service";

@Module({
  imports: [TypeOrmModule.forFeature([ProfitLoss])],
  controllers: [ProfitLossController],
  providers: [ProfitLossService],
})
export class ProfitLossModule {}

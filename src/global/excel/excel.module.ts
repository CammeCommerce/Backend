import { Module } from "@nestjs/common";
import { OrderModule } from "src/domain/order/order.module";
import { ExcelController } from "src/global/excel/controller/excel.controller";
import { ExcelService } from "src/global/excel/service/excel.service";

@Module({
  imports: [OrderModule],
  controllers: [ExcelController],
  providers: [ExcelService],
})
export class ExcelModule {}

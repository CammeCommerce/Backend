import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ExcelService } from "src/global/excel/service/excel.service";
import { OrderService } from "src/domain/order/service/order.service";
import { ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { UploadExcelDto } from "../dto/request/upload-excel.dto";

@Controller("excel")
export class ExcelController {
  constructor(
    private readonly excelService: ExcelService,
    private readonly orderService: OrderService
  ) {}

  @ApiOperation({
    summary: "엑셀 파일 업로드",
    operationId: "uploadExcel",
    tags: ["excel"],
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "엑셀 파일 업로드 및 각 열의 인덱스 설정",
    type: UploadExcelDto,
  })
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body("productNameIndex") productNameIndex: string,
    @Body("quantityIndex") quantityIndex: string,
    @Body("orderDateIndex") orderDateIndex: string,
    @Body("purchasePlaceIndex") purchasePlaceIndex: string,
    @Body("salesPlaceIndex") salesPlaceIndex: string,
    @Body("purchasePriceIndex") purchasePriceIndex: string,
    @Body("salesPriceIndex") salesPriceIndex: string,
    @Body("purchaseShippingFeeIndex") purchaseShippingFeeIndex: string,
    @Body("salesShippingFeeIndex") salesShippingFeeIndex: string,
    @Body("taxTypeIndex") taxTypeIndex: string,
    @Body("marginAmountIndex") marginAmountIndex: string,
    @Body("shippingDifferenceIndex") shippingDifferenceIndex: string
  ): Promise<void> {
    // 엑셀 파일 파싱 및 주문 데이터 저장
    const parsedOrders = await this.excelService.parseExcel(
      file,
      productNameIndex,
      quantityIndex,
      orderDateIndex,
      purchasePlaceIndex,
      salesPlaceIndex,
      purchasePriceIndex,
      salesPriceIndex,
      purchaseShippingFeeIndex,
      salesShippingFeeIndex,
      taxTypeIndex,
      marginAmountIndex,
      shippingDifferenceIndex
    );

    await this.orderService.saveParsedOrders(parsedOrders);
  }
}

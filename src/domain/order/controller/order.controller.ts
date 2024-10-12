import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { OrderService } from "src/domain/order/service/order.service";
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { GetOrdersDto } from "src/domain/order/dto/response/get-order.dto";
import { ModifyOrderDto } from "src/domain/order/dto/request/modify-order.dto";
import { ModifyOrderResultDto } from "src/domain/order/dto/response/modify-order-result.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadOrderExcelDto } from "src/domain/order/dto/request/upload-order-excel.dto";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @ApiOperation({
    summary: "주문 엑셀 파일 업로드",
    operationId: "uploadExcelAndSaveOrders",
    tags: ["order"],
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "엑셀 파일 업로드 및 각 열의 인덱스 설정",
    type: UploadOrderExcelDto,
  })
  @Post("excel/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadExcelAndSaveOrders(
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
    await this.orderService.parseExcelAndSaveOrders(
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
  }

  @ApiOperation({
    summary: "주문값 조회",
    operationId: "getOrders",
    tags: ["order"],
  })
  @Get()
  async getOrders(): Promise<GetOrdersDto> {
    return await this.orderService.getOrders();
  }

  @ApiOperation({
    summary: "주문 검색 및 필터링",
    operationId: "searchOrders",
    tags: ["order"],
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "발주일자 시작 날짜",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "발주일자 종료 날짜",
  })
  @ApiQuery({
    name: "periodType",
    required: false,
    description: "기간 필터 (어제, 지난 3일, 일주일, 1개월, 3개월, 6개월)",
  })
  @ApiQuery({ name: "mediumName", required: false, description: "매체명" })
  @ApiQuery({
    name: "isMediumMatched",
    required: false,
    description: "매체명 매칭 여부",
  })
  @ApiQuery({
    name: "settlementCompanyName",
    required: false,
    description: "정산업체명",
  })
  @ApiQuery({
    name: "isSettlementCompanyMatched",
    required: false,
    description: "정산업체명 매칭 여부",
  })
  @ApiQuery({
    name: "searchQuery",
    required: false,
    description: "검색창에서 검색 (상품명, 구매처, 판매처 등)",
  })
  @Get("search")
  async searchOrders(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string,
    @Query("mediumName") mediumName: string,
    @Query("isMediumMatched") isMediumMatched: any,
    @Query("settlementCompanyName") settlementCompanyName: string,
    @Query("isSettlementCompanyMatched") isSettlementCompanyMatched: any,
    @Query("searchQuery") searchQuery: string
  ): Promise<GetOrdersDto> {
    return await this.orderService.searchOrders(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType,
      mediumName,
      isMediumMatched,
      settlementCompanyName,
      isSettlementCompanyMatched,
      searchQuery
    );
  }

  @ApiOperation({
    summary: "주문값 수정",
    operationId: "modifyOrder",
    tags: ["order"],
  })
  @Patch(":id")
  async modifyOrder(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ModifyOrderDto
  ): Promise<ModifyOrderResultDto> {
    return await this.orderService.modifyOrder(id, dto);
  }

  @ApiOperation({
    summary: "주문값 삭제",
    operationId: "deleteOrder",
    tags: ["order"],
  })
  @Delete(":id")
  @HttpCode(204)
  async deleteOrder(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.orderService.deleteOrder(id);
  }
}

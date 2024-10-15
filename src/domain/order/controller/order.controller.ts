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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { OrderService } from "src/domain/order/service/order.service";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import {
  GetOrdersDto,
  OrderDetailDto,
} from "src/domain/order/dto/response/get-order.dto";
import { ModifyOrderDto } from "src/domain/order/dto/request/modify-order.dto";
import { ModifyOrderResultDto } from "src/domain/order/dto/response/modify-order-result.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadOrderExcelDto } from "src/domain/order/dto/request/upload-order-excel.dto";
import { GetSortedOrdersDto } from "src/domain/order/dto/response/get-sorted-order.dto";
import { Response } from "express";
import { GetOrderColumnIndexDto } from "src/domain/order/dto/response/get-order-column-index.dto";
import { LoginGuard } from "src/domain/auth/login.guard";

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
  @UseGuards(LoginGuard)
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
      taxTypeIndex
    );
  }

  @ApiOperation({
    summary: "저장된 열 인덱스 조회",
    operationId: "getOrderColumnIndex",
    tags: ["order"],
  })
  @UseGuards(LoginGuard)
  @Get("column-index")
  async getOrderColumnIndex(): Promise<GetOrderColumnIndexDto> {
    return await this.orderService.getOrderColumnIndex();
  }

  @ApiOperation({
    summary: "주문값 조회",
    operationId: "getOrders",
    tags: ["order"],
  })
  @UseGuards(LoginGuard)
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
  @UseGuards(LoginGuard)
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
    summary: "주문값 정렬",
    operationId: "sortOrders",
    tags: ["order"],
  })
  @ApiQuery({ name: "field", required: true, description: "정렬할 필드명" })
  @ApiQuery({
    name: "order",
    required: true,
    description: "정렬 방식 (asc=오름차순, desc=내림차순)",
  })
  @UseGuards(LoginGuard)
  @Get("sort")
  async sortOrders(
    @Query("field") field: string,
    @Query("order") order: "asc" | "desc"
  ): Promise<GetSortedOrdersDto> {
    return await this.orderService.sortOrders(field, order);
  }

  @ApiOperation({
    summary: "검색된 주문값 엑셀 다운로드",
    operationId: "downloadOrdersExcel",
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
  @ApiResponse({
    status: 200,
    description: "엑셀 파일 다운로드",
    schema: {
      type: "string",
      format: "binary",
    },
  })
  @UseGuards(LoginGuard)
  @Get("excel/download")
  async downloadOrdersExcel(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string,
    @Query("mediumName") mediumName: string,
    @Query("isMediumMatched") isMediumMatched: any,
    @Query("settlementCompanyName") settlementCompanyName: string,
    @Query("isSettlementCompanyMatched") isSettlementCompanyMatched: any,
    @Query("searchQuery") searchQuery: string,
    @Res() res: Response
  ): Promise<void> {
    const excelFile = await this.orderService.downloadOrdersExcel(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType,
      mediumName,
      isMediumMatched,
      settlementCompanyName,
      isSettlementCompanyMatched,
      searchQuery
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="orders_${new Date().toISOString()}.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.end(excelFile);
  }

  @ApiOperation({
    summary: "주문값 선택 삭제",
    operationId: "deleteOrders",
    tags: ["order"],
  })
  @ApiBody({
    description: "삭제할 주문 ID 목록",
    schema: {
      type: "object",
      properties: {
        ids: {
          type: "array",
          items: {
            type: "number",
          },
        },
      },
    },
  })
  @UseGuards(LoginGuard)
  @Delete()
  @HttpCode(204)
  async deleteOrders(@Body("ids") ids: number[]): Promise<void> {
    return await this.orderService.deleteOrders(ids);
  }

  @ApiOperation({
    summary: "주문값 상세 조회",
    operationId: "getOrderDetailById",
    tags: ["order"],
  })
  @UseGuards(LoginGuard)
  @Get(":id")
  async getOrderDetailById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<OrderDetailDto> {
    return await this.orderService.getOrderDetailById(id);
  }

  @ApiOperation({
    summary: "주문값 수정",
    operationId: "modifyOrder",
    tags: ["order"],
  })
  @UseGuards(LoginGuard)
  @Patch(":id")
  async modifyOrder(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ModifyOrderDto
  ): Promise<ModifyOrderResultDto> {
    return await this.orderService.modifyOrder(id, dto);
  }
}

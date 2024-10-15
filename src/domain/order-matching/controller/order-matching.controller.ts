import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { OrderMatchingService } from "src/domain/order-matching/service/order-matching.service";
import { ApiBody, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { CreateOrderMatchingDto } from "src/domain/order-matching/dto/request/create-order-matching.dto";
import { CreateOrderMatchingResultDto } from "src/domain/order-matching/dto/response/create-order-matching-result.dto";
import { GetOrderMatchingsDto } from "src/domain/order-matching/dto/response/get-order-matching.dto";
import { LoginGuard } from "src/domain/auth/login.guard";

@Controller("order-matching")
export class OrderMatchingController {
  constructor(private readonly orderMatchingService: OrderMatchingService) {}

  @ApiOperation({
    summary: "주문 매칭 등록",
    operationId: "createOrderMatching",
    tags: ["order-matching"],
  })
  @UseGuards(LoginGuard)
  @Post()
  async createOrderMatching(
    @Body() dto: CreateOrderMatchingDto
  ): Promise<CreateOrderMatchingResultDto> {
    return await this.orderMatchingService.createOrderMatching(dto);
  }

  @ApiOperation({
    summary: "주문 매칭 조회",
    operationId: "getOrderMatchings",
    tags: ["order-matching"],
  })
  @UseGuards(LoginGuard)
  @Get()
  async getOrderMatchings(): Promise<GetOrderMatchingsDto> {
    return await this.orderMatchingService.getOrderMatchings();
  }

  @ApiOperation({
    summary: "주문 매칭 검색 및 필터링",
    operationId: "searchOrderMatchings",
    tags: ["order-matching"],
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "매칭일자 시작 날짜",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "매칭일자 종료 날짜",
  })
  @ApiQuery({
    name: "periodType",
    required: false,
    description: "기간 필터 (어제, 지난 3일, 일주일, 1개월, 3개월, 6개월)",
  })
  @ApiQuery({ name: "mediumName", required: false, description: "매체명" })
  @ApiQuery({
    name: "settlementCompanyName",
    required: false,
    description: "정산업체명",
  })
  @ApiQuery({
    name: "searchQuery",
    required: false,
    description: "매입처 또는 매출처 키워드 검색",
  })
  @UseGuards(LoginGuard)
  @Get("search")
  async searchOrderMatchings(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string,
    @Query("mediumName") mediumName: string,
    @Query("settlementCompanyName") settlementCompanyName: string,
    @Query("searchQuery") searchQuery: string
  ): Promise<GetOrderMatchingsDto> {
    return await this.orderMatchingService.searchOrderMatchings(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType,
      mediumName,
      settlementCompanyName,
      searchQuery
    );
  }

  @ApiOperation({
    summary: "주문 매칭 선택 삭제",
    operationId: "deleteOrderMatchings",
    tags: ["order-matching"],
  })
  @ApiBody({
    description: "삭제할 주문 매칭 ID 목록",
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
  async deleteOrderMatchings(@Body("ids") ids: number[]): Promise<void> {
    return await this.orderMatchingService.deleteOrderMatchings(ids);
  }
}

import { Body, Controller, Get, Post } from "@nestjs/common";
import { OrderMatchingService } from "src/domain/order-matching/service/order-matching.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateOrderMatchingDto } from "src/domain/order-matching/dto/request/create-order-matching.dto";
import { CreateOrderMatchingResultDto } from "src/domain/order-matching/dto/response/create-order-matching-result.dto";
import { GetOrderMatchingsDto } from "src/domain/order-matching/dto/response/get-order-matching.dto";

@Controller("order-matching")
export class OrderMatchingController {
  constructor(private readonly orderMatchingService: OrderMatchingService) {}

  @ApiOperation({
    summary: "주문 매칭 등록",
    operationId: "createOrderMatching",
    tags: ["order-matching"],
  })
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
  @Get()
  async getOrderMatchings(): Promise<GetOrderMatchingsDto> {
    return await this.orderMatchingService.getOrderMatchings();
  }
}

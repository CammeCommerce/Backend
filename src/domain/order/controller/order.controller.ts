import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { OrderService } from "src/domain/order/service/order.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateOrderDto } from "src/domain/order/dto/request/create-order.dto";
import { CreateOrderResultDto } from "src/domain/order/dto/response/create-order.result.dto";
import { GetOrdersDto } from "src/domain/order/dto/response/get-order.dto";
import { ModifyOrderDto } from "src/domain/order/dto/request/modify-order.dto";
import { ModifyOrderResultDto } from "src/domain/order/dto/response/modify-order-result.dto";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({
    summary: "주문값 등록",
    operationId: "createOrder",
    tags: ["order"],
  })
  @Post()
  async createOrder(
    @Body() dto: CreateOrderDto
  ): Promise<CreateOrderResultDto> {
    return await this.orderService.createOrder(dto);
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
}

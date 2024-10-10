import { Body, Controller, Post } from "@nestjs/common";
import { OrderService } from "src/domain/order/service/order.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateOrderDto } from "src/domain/order/dto/request/create-order.dto";
import { CreateOrderResultDto } from "src/domain/order/dto/response/create-order.result.dto";

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
}

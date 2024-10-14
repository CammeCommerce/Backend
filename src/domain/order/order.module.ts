import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "src/domain/order/entity/order.entity";
import { OrderController } from "src/domain/order/controller/order.controller";
import { OrderService } from "src/domain/order/service/order.service";
import { OrderMatching } from "src/domain/order-matching/entity/order-matching.entity";
import { OrderColumnIndex } from "src/domain/order/entity/order-column-index.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderMatching, OrderColumnIndex])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

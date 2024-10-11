import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "src/domain/order/entity/order.entity";
import { OrderController } from "src/domain/order/controller/order.controller";
import { OrderService } from "src/domain/order/service/order.service";

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

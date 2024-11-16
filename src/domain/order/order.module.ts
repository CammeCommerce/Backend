import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entity/order.entity";
import { OrderMatching } from "../order-matching/entity/order-matching.entity";
import { OrderColumnIndex } from "./entity/order-column-index.entity";
import { AuthModule } from "../auth/auth.module";
import { OrderController } from "./controller/order.controller";
import { OrderService } from "./service/order.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderMatching, OrderColumnIndex]),
    AuthModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

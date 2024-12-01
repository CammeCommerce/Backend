import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderMatching } from "./entity/order-matching.entity";
import { AuthModule } from "../auth/auth.module";
import { OrderMatchingController } from "./controller/order-matching.controller";
import { OrderMatchingService } from "./service/order-matching.service";
import { OrderModule } from "../order/order.module";

@Module({
  imports: [TypeOrmModule.forFeature([OrderMatching]), AuthModule, OrderModule],
  controllers: [OrderMatchingController],
  providers: [OrderMatchingService],
})
export class OrderMatchingModule {}

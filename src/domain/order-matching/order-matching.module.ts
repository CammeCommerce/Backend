import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderMatching } from "./entity/order-matching.entity";
import { AuthModule } from "../auth/auth.module";
import { OrderMatchingController } from "./controller/order-matching.controller";
import { OrderMatchingService } from "./service/order-matching.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrderMatching]), AuthModule],
  controllers: [OrderMatchingController],
  providers: [OrderMatchingService],
})
export class OrderMatchingModule {}

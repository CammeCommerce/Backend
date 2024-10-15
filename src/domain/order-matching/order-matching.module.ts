import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderMatching } from "src/domain/order-matching/entity/order-matching.entity";
import { OrderMatchingController } from "src/domain/order-matching/controller/order-matching.controller";
import { OrderMatchingService } from "src/domain/order-matching/service/order-matching.service";
import { AuthModule } from "src/domain/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([OrderMatching]), AuthModule],
  controllers: [OrderMatchingController],
  providers: [OrderMatchingService],
})
export class OrderMatchingModule {}

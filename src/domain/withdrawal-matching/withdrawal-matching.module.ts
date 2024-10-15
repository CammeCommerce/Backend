import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WithdrawalMatching } from "src/domain/withdrawal-matching/entity/withdrawal-matching.entity";
import { WithdrawalMatchingController } from "src/domain/withdrawal-matching/controller/withdrawal-matching.controller";
import { WithdrawalMatchingService } from "src/domain/withdrawal-matching/service/withdrawal-matching.service";
import { AuthModule } from "src/domain/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([WithdrawalMatching]), AuthModule],
  controllers: [WithdrawalMatchingController],
  providers: [WithdrawalMatchingService],
})
export class WithdrawalMatchingModule {}

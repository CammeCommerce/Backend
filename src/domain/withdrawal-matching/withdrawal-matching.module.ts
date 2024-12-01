import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WithdrawalMatching } from "./entity/withdrawal-matching.entity";
import { AuthModule } from "../auth/auth.module";
import { WithdrawalMatchingController } from "./controller/withdrawal-matching.controller";
import { WithdrawalMatchingService } from "./service/withdrawal-matching.service";
import { WithdrawalModule } from "../withdrawal/withdrawal.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([WithdrawalMatching]),
    AuthModule,
    WithdrawalModule,
  ],
  controllers: [WithdrawalMatchingController],
  providers: [WithdrawalMatchingService],
})
export class WithdrawalMatchingModule {}

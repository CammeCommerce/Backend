import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { WithdrawalService } from "src/domain/withdrawal/service/withdrawal.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateWithdrawalDto } from "src/domain/withdrawal/dto/request/create-withdrawal.dto";
import { CreateWithdrawalResultDto } from "src/domain/withdrawal/dto/response/create-withdrawal-result.dto";
import { GetWithdrawalDto } from "src/domain/withdrawal/dto/response/get-withdrawal.dto";
import { ModifyWithdrawalDto } from "src/domain/withdrawal/dto/request/modify-withdrawal.dto";
import { ModifyWithdrawalResultDto } from "src/domain/withdrawal/dto/response/modify-withdrawal-result.dto";

@Controller("withdrawal")
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @ApiOperation({
    summary: "출금값 등록",
    operationId: "createWithdrawal",
    tags: ["withdrawal"],
  })
  @Post()
  async createWithdrawal(
    @Body() dto: CreateWithdrawalDto
  ): Promise<CreateWithdrawalResultDto> {
    return await this.withdrawalService.createWithdrawal(dto);
  }

  @ApiOperation({
    summary: "출금값 조회",
    operationId: "getWithdrawals",
    tags: ["withdrawal"],
  })
  @Get()
  async getWithdrawals(): Promise<GetWithdrawalDto> {
    return await this.withdrawalService.getWithdrawals();
  }

  @ApiOperation({
    summary: "출금값 수정",
    operationId: "modifyWithdrawal",
    tags: ["withdrawal"],
  })
  @Patch(":id")
  async modifyWithdrawal(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ModifyWithdrawalDto
  ): Promise<ModifyWithdrawalResultDto> {
    return await this.withdrawalService.modifyWithdrawal(id, dto);
  }
}

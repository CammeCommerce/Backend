import { Body, Controller, Get, Post } from "@nestjs/common";
import { WithdrawalService } from "src/domain/withdrawal/service/withdrawal.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateWithdrawalDto } from "src/domain/withdrawal/dto/request/create-withdrawal.dto";
import { CreateWithdrawalResultDto } from "src/domain/withdrawal/dto/response/create-withdrawal-result.dto";
import { GetWithdrawalDto } from "src/domain/withdrawal/dto/response/get-withdrawal.dto";

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
}

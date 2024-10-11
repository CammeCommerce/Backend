import { Body, Controller, Post } from "@nestjs/common";
import { DepositService } from "src/domain/deposit/service/deposit.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateDepositDto } from "src/domain/deposit/dto/request/create-deposit.dto";
import { CreateDepositResultDto } from "src/domain/deposit/dto/response/create-deposit-result.dto";

@Controller("deposit")
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @ApiOperation({
    summary: "입금값 등록",
    operationId: "createDeposit",
    tags: ["deposit"],
  })
  @Post()
  async createDeposit(
    @Body() dto: CreateDepositDto
  ): Promise<CreateDepositResultDto> {
    return await this.depositService.createDeposit(dto);
  }
}

import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { WithdrawalMatchingService } from "src/domain/withdrawal-matching/service/withdrawal-matching.service";
import { CreateWithdrawalMatchingDto } from "src/domain/withdrawal-matching/dto/request/create-withdrawal-matching.dto";
import { CreateWithdrawalMatchingResultDto } from "src/domain/withdrawal-matching/dto/response/create-withdrawal-matching-result.dto";

@Controller("withdrawal-matching")
export class WithdrawalMatchingController {
  constructor(
    private readonly withdrawalMatchingService: WithdrawalMatchingService
  ) {}

  @ApiOperation({
    summary: "출금 매칭 등록",
    operationId: "createWithdrawalMatching",
    tags: ["withdrawal-matching"],
  })
  @Post()
  async createWithdrawalMatching(
    @Body() dto: CreateWithdrawalMatchingDto
  ): Promise<CreateWithdrawalMatchingResultDto> {
    return await this.withdrawalMatchingService.createWithdrawalMatching(dto);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";
import { DepositMatchingService } from "src/domain/deposit-matching/service/deposit-matching.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateDepositMatchingDto } from "src/domain/deposit-matching/dto/request/create-deposit-matching.dto";
import { CreateDepositMatchingResultDto } from "src/domain/deposit-matching/dto/response/create-deposit-matching-result.dto";
import { GetDepositMatchingsDto } from "src/domain/deposit-matching/dto/response/get-deposit-matching.dto";

@Controller("deposit-matching")
export class DepositMatchingController {
  constructor(
    private readonly depositMatchingService: DepositMatchingService
  ) {}

  @ApiOperation({
    summary: "입금 매칭 등록",
    operationId: "createDepositMatching",
    tags: ["deposit-matching"],
  })
  @Post()
  async createDepositMatching(
    @Body() dto: CreateDepositMatchingDto
  ): Promise<CreateDepositMatchingResultDto> {
    return await this.depositMatchingService.createDepositMatching(dto);
  }

  @ApiOperation({
    summary: "입금 매칭 조회",
    operationId: "getDepositMatchings",
    tags: ["deposit-matching"],
  })
  @Get()
  async getDepositMatchings(): Promise<GetDepositMatchingsDto> {
    return await this.depositMatchingService.getDepositMatchings();
  }

  @ApiOperation({
    summary: "입금 매칭 삭제",
    operationId: "deleteDepositMatching",
    tags: ["deposit-matching"],
  })
  @Delete(":id")
  @HttpCode(204)
  async deleteDepositMatching(
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    return await this.depositMatchingService.deleteDepositMatching(id);
  }
}

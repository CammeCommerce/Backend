import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";
import { DepositMatchingService } from "src/domain/deposit-matching/service/deposit-matching.service";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
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
    summary: "입금 매칭 검색 및 필터링",
    operationId: "searchDepositMatchings",
    tags: ["deposit-matching"],
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "매칭일자 시작 날짜",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "매칭일자 종료 날짜",
  })
  @ApiQuery({
    name: "periodType",
    required: false,
    description: "기간 필터 (어제, 지난 3일, 일주일, 1개월, 3개월, 6개월)",
  })
  @ApiQuery({ name: "mediumName", required: false, description: "매체명" })
  @ApiQuery({
    name: "searchQuery",
    required: false,
    description: "계좌 별칭 또는 용도 키워드 검색",
  })
  @Get("search")
  async searchDepositMatchings(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string,
    @Query("mediumName") mediumName: string,
    @Query("searchQuery") searchQuery: string
  ): Promise<GetDepositMatchingsDto> {
    return await this.depositMatchingService.searchDepositMatchings(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType,
      mediumName,
      searchQuery
    );
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

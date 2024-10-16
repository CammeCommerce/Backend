import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { WithdrawalMatchingService } from "src/domain/withdrawal-matching/service/withdrawal-matching.service";
import { CreateWithdrawalMatchingDto } from "src/domain/withdrawal-matching/dto/request/create-withdrawal-matching.dto";
import { CreateWithdrawalMatchingResultDto } from "src/domain/withdrawal-matching/dto/response/create-withdrawal-matching-result.dto";
import { GetWithdrawalMatchingsDto } from "src/domain/withdrawal-matching/dto/response/get-withdrawal-matching.dto";

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

  @ApiOperation({
    summary: "출금 매칭 조회",
    operationId: "getWithdrawalMatchings",
    tags: ["withdrawal-matching"],
  })
  @Get()
  async getWithdrawalMatchings(): Promise<GetWithdrawalMatchingsDto> {
    return await this.withdrawalMatchingService.getWithdrawalMatchings();
  }

  @ApiOperation({
    summary: "출금 매칭 검색 및 필터링",
    operationId: "searchWithdrawalMatchings",
    tags: ["withdrawal-matching"],
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
  async searchWithdrawalMatchings(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string,
    @Query("mediumName") mediumName: string,
    @Query("searchQuery") searchQuery: string
  ): Promise<GetWithdrawalMatchingsDto> {
    return await this.withdrawalMatchingService.searchWithdrawalMatchings(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType,
      mediumName,
      searchQuery
    );
  }

  @ApiOperation({
    summary: "출금 매칭 선택 삭제",
    operationId: "deleteWithdrawalMatchings",
    tags: ["withdrawal-matching"],
  })
  @ApiBody({
    description: "삭제할 출금 매칭 ID 목록",
    schema: {
      type: "object",
      properties: {
        ids: {
          type: "array",
          items: {
            type: "number",
          },
        },
      },
    },
  })
  @Delete()
  @HttpCode(204)
  async deleteWithdrawalMatchings(@Body("ids") ids: number[]): Promise<void> {
    return await this.withdrawalMatchingService.deleteWithdrawalMatchings(ids);
  }
}

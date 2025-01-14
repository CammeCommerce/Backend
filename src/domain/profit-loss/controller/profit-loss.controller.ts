import { Controller, Get, Query } from "@nestjs/common";
import { ProfitLossService } from "../service/profit-loss.service";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { GetProfitLossDto } from "../dto/response/get-profit-loss.dto";

@Controller("profit-loss")
export class ProfitLossController {
  constructor(private readonly profitLossService: ProfitLossService) {}

  @ApiOperation({ summary: "손익계산서 검색 및 필터링" })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "검색 시작 날짜(월)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "검색 종료 날짜(월)",
  })
  @ApiQuery({
    name: "mediumName",
    required: false,
    description: "매체명으로 검색",
  })
  @Get()
  async getProfitLoss(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("mediumName") mediumName: string
  ): Promise<GetProfitLossDto> {
    return await this.profitLossService.getProfitLoss(
      startDate,
      endDate,
      mediumName
    );
  }
}

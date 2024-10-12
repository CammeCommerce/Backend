import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { ProfitLossService } from "src/domain/profit-loss/service/profit-loss.service";
import { GetProfitLossDto } from "src/domain/profit-loss/dto/response/get-profit-loss.dto";

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
  @Get("calculate")
  async getProfitLoss(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("mediumName") mediumName: string
  ): Promise<GetProfitLossDto> {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return await this.profitLossService.getProfitLoss(start, end, mediumName);
  }
}

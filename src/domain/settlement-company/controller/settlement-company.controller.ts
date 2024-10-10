import { Body, Controller, Get, Post } from "@nestjs/common";
import { SettlementCompanyService } from "src/domain/settlement-company/service/settlement-company.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateSettlementCompanyDto } from "src/domain/settlement-company/dto/request/create-settlement-company.dto";
import { CreateSettlementCompanyResultDto } from "src/domain/settlement-company/dto/response/create-settlement-company-result.dto";
import { GetSettlementCompaniesDto } from "src/domain/settlement-company/dto/response/get-settlement-company.dto";

@Controller("settlement-company")
export class SettlementCompanyController {
  constructor(
    private readonly settlementCompanyService: SettlementCompanyService
  ) {}

  @ApiOperation({
    summary: "정산업체명 등록",
    operationId: "createSettlementCompany",
    tags: ["settlement-company"],
  })
  @Post()
  async createSettlementCompany(
    @Body() dto: CreateSettlementCompanyDto
  ): Promise<CreateSettlementCompanyResultDto> {
    return await this.settlementCompanyService.createSettlementCompany(dto);
  }

  @ApiOperation({
    summary: "정산업체명 조회",
    operationId: "getSettlementCompanies",
    tags: ["settlement-company"],
  })
  @Get()
  async getSettlementCompanies(): Promise<GetSettlementCompaniesDto> {
    return await this.settlementCompanyService.getSettlementCompanies();
  }
}

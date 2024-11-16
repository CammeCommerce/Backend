import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { SettlementCompanyService } from "../service/settlement-company.service";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { CreateSettlementCompanyDto } from "../dto/request/create-settlement-company.dto";
import { CreateSettlementCompanyResultDto } from "../dto/response/create-settlement-company-result.dto";
import { GetSettlementCompaniesDto } from "../dto/response/get-settlement-company.dto";
import { ModifySettlementCompanyDto } from "../dto/request/modify-settlement-company.dto";
import { ModifySettlementCompanyResultDto } from "../dto/response/modify-settlement-company-result.dto";

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

  @ApiOperation({
    summary: "정산업체명 검색 및 필터링",
    operationId: "searchSettlementCompanies",
    tags: ["settlement-company"],
  })
  @ApiQuery({ name: "name", required: false, description: "검색할 정산업체명" })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "검색할 등록일자 시작 날짜",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "검색할 등록일자 종료 날짜",
  })
  @ApiQuery({
    name: "periodType",
    required: false,
    description:
      '기간 필터 ("어제", "지난 3일", "일주일", "1개월", "3개월", "6개월")',
  })
  @Get("search")
  async searchSettlementCompanies(
    @Query("name") name: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string
  ): Promise<GetSettlementCompaniesDto> {
    return await this.settlementCompanyService.searchSettlementCompanies(
      name,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType
    );
  }

  @ApiOperation({
    summary: "정산업체명 수정",
    operationId: "modifySettlementCompany",
    tags: ["settlement-company"],
  })
  @Patch(":id")
  async modifySettlementCompany(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ModifySettlementCompanyDto
  ): Promise<ModifySettlementCompanyResultDto> {
    return await this.settlementCompanyService.modifySettlementCompany(id, dto);
  }

  @ApiOperation({
    summary: "정산업체명 삭제",
    operationId: "deleteSettlementCompany",
    tags: ["settlement-company"],
  })
  @Delete(":id")
  @HttpCode(204)
  async deleteSettlementCompany(
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    return await this.settlementCompanyService.deleteSettlementCompany(id);
  }
}

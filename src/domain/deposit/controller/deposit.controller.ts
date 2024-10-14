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
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { DepositService } from "src/domain/deposit/service/deposit.service";
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { GetDepositsDto } from "src/domain/deposit/dto/response/get-deposit.dto";
import { ModifyDepositDto } from "src/domain/deposit/dto/request/modify-deposit.dto";
import { ModifyDepositResultDto } from "src/domain/deposit/dto/response/modify-deposit-result.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadDepositExcelDto } from "src/domain/deposit/dto/request/upload-deposit-excel.dto";
import { Response } from "express";
import { GetDepositColumnIndexDto } from "src/domain/deposit/dto/response/get-deposit-column-index.dto";

@Controller("deposit")
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @ApiOperation({
    summary: "입금 엑셀 파일 업로드",
    operationId: "uploadAndSaveDeposits",
    tags: ["deposit"],
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "엑셀 파일 업로드 및 각 열의 인덱스 설정",
    type: UploadDepositExcelDto,
  })
  @Post("excel/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadAndSaveDeposits(
    @UploadedFile() file: Express.Multer.File,
    @Body("depositDateIndex") depositDateIndex: string,
    @Body("accountAliasIndex") accountAliasIndex: string,
    @Body("depositAmountIndex") depositAmountIndex: string,
    @Body("accountDescriptionIndex") accountDescriptionIndex: string,
    @Body("transactionMethod1Index") transactionMethod1Index: string,
    @Body("transactionMethod2Index") transactionMethod2Index: string,
    @Body("accountMemoIndex") accountMemoIndex: string,
    @Body("counterpartyNameIndex") counterpartyNameIndex: string,
    @Body("purposeIndex") purposeIndex: string,
    @Body("clientNameIndex") clientNameIndex: string
  ): Promise<void> {
    await this.depositService.parseExcelAndSaveDeposits(
      file,
      depositDateIndex,
      accountAliasIndex,
      depositAmountIndex,
      accountDescriptionIndex,
      transactionMethod1Index,
      transactionMethod2Index,
      accountMemoIndex,
      counterpartyNameIndex,
      purposeIndex,
      clientNameIndex
    );
  }

  @ApiOperation({
    summary: "저장된 열 인덱스 조회",
    operationId: "getDepositColumnIndex",
    tags: ["deposit"],
  })
  @Get("column-index")
  async getDepositColumnIndex(): Promise<GetDepositColumnIndexDto> {
    return await this.depositService.getDepositColumnIndex();
  }

  @ApiOperation({
    summary: "입금값 조회",
    operationId: "getDeposits",
    tags: ["deposit"],
  })
  @Get()
  async getDeposits(): Promise<GetDepositsDto> {
    return await this.depositService.getDeposits();
  }

  @ApiOperation({
    summary: "입금 검색 및 필터링",
    operationId: "searchDeposits",
    tags: ["deposit"],
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "발주일자 시작 날짜",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "발주일자 종료 날짜",
  })
  @ApiQuery({
    name: "periodType",
    required: false,
    description: "기간 필터 (어제, 지난 3일, 일주일, 1개월, 3개월, 6개월)",
  })
  @ApiQuery({ name: "mediumName", required: false, description: "매체명" })
  @ApiQuery({
    name: "isMediumMatched",
    required: false,
    description: "매체명 매칭 여부",
  })
  @ApiQuery({
    name: "searchQuery",
    required: false,
    description: "계좌별칭 또는 용도 검색",
  })
  @Get("search")
  async searchDeposits(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string,
    @Query("mediumName") mediumName: string,
    @Query("isMediumMatched") isMediumMatched: any,
    @Query("searchQuery") searchQuery: string
  ): Promise<GetDepositsDto> {
    return await this.depositService.searchDeposits(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType,
      mediumName,
      isMediumMatched,
      searchQuery
    );
  }

  @ApiOperation({
    summary: "검색된 입금값 엑셀 다운로드",
    operationId: "downloadDepositsExcel",
    tags: ["deposit"],
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "발주일자 시작 날짜",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "발주일자 종료 날짜",
  })
  @ApiQuery({
    name: "periodType",
    required: false,
    description: "기간 필터 (어제, 지난 3일, 일주일, 1개월, 3개월, 6개월)",
  })
  @ApiQuery({ name: "mediumName", required: false, description: "매체명" })
  @ApiQuery({
    name: "isMediumMatched",
    required: false,
    description: "매체명 매칭 여부",
  })
  @ApiQuery({
    name: "searchQuery",
    required: false,
    description: "계좌별칭 또는 용도 검색",
  })
  @Get("excel/download")
  async downloadDepositsExcel(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string,
    @Query("mediumName") mediumName: string,
    @Query("isMediumMatched") isMediumMatched: any,
    @Query("searchQuery") searchQuery: string,
    @Res() res: Response
  ): Promise<void> {
    const excelFile = await this.depositService.downloadDepositsExcel(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType,
      mediumName,
      isMediumMatched,
      searchQuery
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="deposits.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.end(excelFile);
  }

  @ApiOperation({
    summary: "입금값 수정",
    operationId: "modifyDeposit",
    tags: ["deposit"],
  })
  @Patch(":id")
  async modifyDeposit(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ModifyDepositDto
  ): Promise<ModifyDepositResultDto> {
    return await this.depositService.modifyDeposit(id, dto);
  }

  @ApiOperation({
    summary: "입금값 선택 삭제",
    operationId: "deleteDeposits",
    tags: ["deposit"],
  })
  @ApiBody({
    description: "삭제할 입금 ID 목록",
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
  async deleteDeposits(@Body("ids") ids: number[]): Promise<void> {
    return await this.depositService.deleteDeposits(ids);
  }
}

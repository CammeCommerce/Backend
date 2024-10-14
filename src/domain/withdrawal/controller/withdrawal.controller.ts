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
import { WithdrawalService } from "src/domain/withdrawal/service/withdrawal.service";
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { GetWithdrawalDto } from "src/domain/withdrawal/dto/response/get-withdrawal.dto";
import { ModifyWithdrawalDto } from "src/domain/withdrawal/dto/request/modify-withdrawal.dto";
import { ModifyWithdrawalResultDto } from "src/domain/withdrawal/dto/response/modify-withdrawal-result.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadWithdrawalExcelDto } from "src/domain/withdrawal/dto/request/upload-withdrawal-excel.dto";
import { Response } from "express";
import { GetWithdrawalColumnIndexDto } from "src/domain/withdrawal/dto/response/get-withdrawal-column-index.dto";

@Controller("withdrawal")
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @ApiOperation({
    summary: "출금 엑셀 업로드",
    operationId: "uploadWithdrawalExcel",
    tags: ["withdrawal"],
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "출금 데이터를 포함한 엑셀 파일 업로드 및 열 인덱스 설정",
    type: UploadWithdrawalExcelDto,
  })
  @Post("excel/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadWithdrawalExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body("withdrawalDateIndex") withdrawalDateIndex: string,
    @Body("accountAliasIndex") accountAliasIndex: string,
    @Body("withdrawalAmountIndex") withdrawalAmountIndex: string,
    @Body("accountDescriptionIndex") accountDescriptionIndex: string,
    @Body("transactionMethod1Index") transactionMethod1Index: string,
    @Body("transactionMethod2Index") transactionMethod2Index: string,
    @Body("accountMemoIndex") accountMemoIndex: string,
    @Body("purposeIndex") purposeIndex: string,
    @Body("clientNameIndex") clientNameIndex: string
  ): Promise<void> {
    // 엑셀 파일 파싱 및 출금 데이터 저장
    await this.withdrawalService.parseExcelAndSaveWithdrawals(
      file,
      withdrawalDateIndex,
      accountAliasIndex,
      withdrawalAmountIndex,
      accountDescriptionIndex,
      transactionMethod1Index,
      transactionMethod2Index,
      accountMemoIndex,
      purposeIndex,
      clientNameIndex
    );
  }

  @ApiOperation({
    summary: "저장된 열 인덱스 조회",
    operationId: "getWithdrawalColumnIndex",
    tags: ["withdrawal"],
  })
  @Get("column-index")
  async getWithdrawalColumnIndex(): Promise<GetWithdrawalColumnIndexDto> {
    return await this.withdrawalService.getWithdrawalColumnIndex();
  }

  @ApiOperation({
    summary: "출금값 조회",
    operationId: "getWithdrawals",
    tags: ["withdrawal"],
  })
  @Get()
  async getWithdrawals(): Promise<GetWithdrawalDto> {
    return await this.withdrawalService.getWithdrawals();
  }

  @ApiOperation({
    summary: "출금 검색 및 필터링",
    operationId: "searchWithdrawals",
    tags: ["withdrawal"],
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "출금일자 시작 날짜",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "출금일자 종료 날짜",
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
  async searchWithdrawals(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string,
    @Query("mediumName") mediumName: string,
    @Query("isMediumMatched") isMediumMatched: any,
    @Query("searchQuery") searchQuery: string
  ): Promise<GetWithdrawalDto> {
    return await this.withdrawalService.searchWithdrawals(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType,
      mediumName,
      isMediumMatched,
      searchQuery
    );
  }

  @ApiOperation({
    summary: "검색된 출금값 엑셀 다운로드",
    operationId: "downloadWithdrawalsExcel",
    tags: ["withdrawal"],
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "출금일자 시작 날짜",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "출금일자 종료 날짜",
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
  async downloadWithdrawalsExcel(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string,
    @Query("mediumName") mediumName: string,
    @Query("isMediumMatched") isMediumMatched: any,
    @Query("searchQuery") searchQuery: string,
    @Res() res: Response
  ): Promise<void> {
    const excelFile = await this.withdrawalService.downloadWithdrawalsExcel(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType,
      mediumName,
      isMediumMatched,
      searchQuery
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="withdrawals.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.end(excelFile);
  }

  @ApiOperation({
    summary: "출금값 수정",
    operationId: "modifyWithdrawal",
    tags: ["withdrawal"],
  })
  @Patch(":id")
  async modifyWithdrawal(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ModifyWithdrawalDto
  ): Promise<ModifyWithdrawalResultDto> {
    return await this.withdrawalService.modifyWithdrawal(id, dto);
  }

  @ApiOperation({
    summary: "출금값 선택 삭제",
    operationId: "deleteWithdrawals",
    tags: ["withdrawal"],
  })
  @ApiBody({
    description: "삭제할 출금 ID 목록",
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
  async deleteWithdrawals(@Body("ids") ids: number[]): Promise<void> {
    return await this.withdrawalService.deleteWithdrawals(ids);
  }
}

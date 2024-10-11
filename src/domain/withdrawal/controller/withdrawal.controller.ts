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
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { WithdrawalService } from "src/domain/withdrawal/service/withdrawal.service";
import { ApiBody, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { GetWithdrawalDto } from "src/domain/withdrawal/dto/response/get-withdrawal.dto";
import { ModifyWithdrawalDto } from "src/domain/withdrawal/dto/request/modify-withdrawal.dto";
import { ModifyWithdrawalResultDto } from "src/domain/withdrawal/dto/response/modify-withdrawal-result.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadWithdrawalExcelDto } from "src/domain/withdrawal/dto/request/upload-withdrawal-excel.dto";

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
    summary: "출금값 조회",
    operationId: "getWithdrawals",
    tags: ["withdrawal"],
  })
  @Get()
  async getWithdrawals(): Promise<GetWithdrawalDto> {
    return await this.withdrawalService.getWithdrawals();
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
    summary: "출금값 삭제",
    operationId: "deleteWithdrawal",
    tags: ["withdrawal"],
  })
  @Delete(":id")
  @HttpCode(204)
  async deleteWithdrawal(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.withdrawalService.deleteWithdrawal(id);
  }
}

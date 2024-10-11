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
} from "@nestjs/common";
import { DepositService } from "src/domain/deposit/service/deposit.service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateDepositDto } from "src/domain/deposit/dto/request/create-deposit.dto";
import { CreateDepositResultDto } from "src/domain/deposit/dto/response/create-deposit-result.dto";
import { GetDepositsDto } from "src/domain/deposit/dto/response/get-deposit.dto";
import { ModifyDepositDto } from "src/domain/deposit/dto/request/modify-deposit.dto";
import { ModifyDepositResultDto } from "src/domain/deposit/dto/response/modify-deposit-result.dto";

@Controller("deposit")
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @ApiOperation({
    summary: "입금값 등록",
    operationId: "createDeposit",
    tags: ["deposit"],
  })
  @Post()
  async createDeposit(
    @Body() dto: CreateDepositDto
  ): Promise<CreateDepositResultDto> {
    return await this.depositService.createDeposit(dto);
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
    summary: "입금값 삭제",
    operationId: "deleteDeposit",
    tags: ["deposit"],
  })
  @Delete(":id")
  @HttpCode(204)
  async deleteDeposit(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.depositService.deleteDeposit(id);
  }
}

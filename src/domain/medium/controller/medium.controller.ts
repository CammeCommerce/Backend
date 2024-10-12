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
import { MediumService } from "src/domain/medium/service/medium.service";
import { CreateMediumDto } from "src/domain/medium/dto/request/create-medium.dto";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { GetMediumsDto } from "src/domain/medium/dto/response/get-medium.dto";
import { ModifyMediumDto } from "src/domain/medium/dto/request/modify-medium.dto";
import { ModifyMediumResultDto } from "src/domain/medium/dto/response/modify-medium-result.dto";
import { CreateMediumResultDto } from "src/domain/medium/dto/response/create-medium-result.dto";

@Controller("medium")
export class MediumController {
  constructor(private readonly mediumService: MediumService) {}

  @ApiOperation({
    summary: "매체명 등록",
    operationId: "createMedium",
    tags: ["medium"],
  })
  @Post()
  async createMedium(
    @Body() dto: CreateMediumDto
  ): Promise<CreateMediumResultDto> {
    return await this.mediumService.createMedium(dto);
  }

  @ApiOperation({
    summary: "매체명 조회",
    operationId: "getMediums",
    tags: ["medium"],
  })
  @Get()
  async getMediums(): Promise<GetMediumsDto> {
    return await this.mediumService.getMediums();
  }

  @ApiOperation({
    summary: "매체명 검색 및 필터링",
    operationId: "searchMediums",
    tags: ["medium"],
  })
  @ApiQuery({ name: "name", required: false, description: "검색할 매체명" })
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
  async searchMediums(
    @Query("name") name: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string
  ): Promise<GetMediumsDto> {
    return await this.mediumService.searchMediums(
      name,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType
    );
  }

  @ApiOperation({
    summary: "매체명 수정",
    operationId: "modifyMedium",
    tags: ["medium"],
  })
  @Patch(":id")
  async modifyMedium(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ModifyMediumDto
  ): Promise<ModifyMediumResultDto> {
    return await this.mediumService.modifyMedium(id, dto);
  }

  @ApiOperation({
    summary: "매체명 삭제",
    operationId: "deleteMedium",
    tags: ["medium"],
  })
  @Delete(":id")
  @HttpCode(204)
  async deleteMedium(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.mediumService.deleteMedium(id);
  }
}

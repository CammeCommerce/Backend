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
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { OnlineService } from "src/domain/online/service/online.service";
import { CreateOnlineDto } from "src/domain/online/dto/request/create-online.dto";
import { CreateOnlineResultDto } from "src/domain/online/dto/response/create-online.result.dto";
import { GetOnlineDto } from "src/domain/online/dto/response/get-online.dto";
import { ModifyOnlineDto } from "src/domain/online/dto/request/modify-online.dto";
import { ModifyOnlineResultDto } from "src/domain/online/dto/response/modify-online-result.dto";

@Controller("online")
export class OnlineController {
  constructor(private readonly onlineService: OnlineService) {}

  @ApiOperation({
    summary: "온라인(행) 등록",
    operationId: "createOnline",
    tags: ["online"],
  })
  @Post()
  async createOnline(
    @Body() dto: CreateOnlineDto
  ): Promise<CreateOnlineResultDto> {
    return await this.onlineService.createOnline(dto);
  }

  @ApiOperation({
    summary: "온라인 리스트 조회",
    operationId: "getOnlines",
    tags: ["online"],
  })
  @Get()
  async getOnlines(): Promise<GetOnlineDto> {
    return await this.onlineService.getOnlines();
  }

  @ApiOperation({
    summary: "온라인(행) 검색 및 필터링",
    operationId: "searchOnlines",
    tags: ["online"],
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "매출일자 시작 (월 기준 검색)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "매출일자 종료 (월 기준 검색)",
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
    description: "키워드 검색",
  })
  @Get("search")
  async searchOnlines(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("periodType") periodType: string,
    @Query("mediumName") mediumName: string,
    @Query("searchQuery") searchQuery: string
  ): Promise<GetOnlineDto> {
    return await this.onlineService.searchOnlines(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      periodType,
      mediumName,
      searchQuery
    );
  }

  @ApiOperation({
    summary: "온라인(행) 수정",
    operationId: "modifyOnline",
    tags: ["online"],
  })
  @Patch(":id")
  async modifyOnline(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ModifyOnlineDto
  ): Promise<ModifyOnlineResultDto> {
    return await this.onlineService.modifyOnline(id, dto);
  }

  @ApiOperation({
    summary: "온라인 값 삭제",
    operationId: "deleteOnline",
    tags: ["online"],
  })
  @Delete(":id")
  @HttpCode(204)
  async deleteOnline(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.onlineService.deleteOnline(id);
  }
}

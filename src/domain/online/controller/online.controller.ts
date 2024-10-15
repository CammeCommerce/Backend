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
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { OnlineService } from "src/domain/online/service/online.service";
import { CreateOnlineDto } from "src/domain/online/dto/request/create-online.dto";
import { CreateOnlineResultDto } from "src/domain/online/dto/response/create-online.result.dto";
import {
  GetOnlineDto,
  OnlineDetailDto,
} from "src/domain/online/dto/response/get-online.dto";
import { ModifyOnlineDto } from "src/domain/online/dto/request/modify-online.dto";
import { ModifyOnlineResultDto } from "src/domain/online/dto/response/modify-online-result.dto";
import { LoginGuard } from "src/domain/auth/login.guard";

@Controller("online")
export class OnlineController {
  constructor(private readonly onlineService: OnlineService) {}

  @ApiOperation({
    summary: "온라인(행) 등록",
    operationId: "createOnline",
    tags: ["online"],
  })
  @UseGuards(LoginGuard)
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
  @UseGuards(LoginGuard)
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
  @UseGuards(LoginGuard)
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
    summary: "온라인 값 선택 삭제",
    operationId: "deleteOnlines",
    tags: ["online"],
  })
  @ApiBody({
    description: "삭제할 온라인 ID 목록",
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
  @UseGuards(LoginGuard)
  @Delete()
  @HttpCode(204)
  async deleteOnlines(@Body("ids") ids: number[]): Promise<void> {
    return await this.onlineService.deleteOnlines(ids);
  }

  @ApiOperation({
    summary: "온라인(행) 상세 조회",
    operationId: "getOnlineDetailById",
    tags: ["online"],
  })
  @UseGuards(LoginGuard)
  @Get(":id")
  async getOnlineDetailById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<OnlineDetailDto> {
    return await this.onlineService.getOnlineDetailById(id);
  }

  @ApiOperation({
    summary: "온라인(행) 수정",
    operationId: "modifyOnline",
    tags: ["online"],
  })
  @UseGuards(LoginGuard)
  @Patch(":id")
  async modifyOnline(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: ModifyOnlineDto
  ): Promise<ModifyOnlineResultDto> {
    return await this.onlineService.modifyOnline(id, dto);
  }
}

import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { OnlineService } from "src/domain/online/service/online.service";
import { CreateOnlineDto } from "src/domain/online/dto/request/create-online.dto";
import { CreateOnlineResultDto } from "src/domain/online/dto/response/create-online.result.dto";
import { GetOnlineDto } from "src/domain/online/dto/response/get-online.dto";

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
}

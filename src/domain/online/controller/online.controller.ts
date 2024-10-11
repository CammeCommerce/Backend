import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { OnlineService } from "src/domain/online/service/online.service";
import { CreateOnlineDto } from "src/domain/online/dto/request/create-online.dto";
import { CreateOnlineResultDto } from "src/domain/online/dto/response/create-online.result.dto";

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
}

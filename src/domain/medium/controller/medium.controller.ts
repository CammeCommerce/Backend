import { Body, Controller, Get, Post } from "@nestjs/common";
import { MediumService } from "src/domain/medium/service/medium.service";
import { createMediumDto } from "src/domain/medium/dto/request/create-medium.dto";
import { ApiOperation } from "@nestjs/swagger";
import { GetMediumsDto } from "src/domain/medium/dto/response/get-medium.dto";

@Controller("medium")
export class MediumController {
  constructor(private readonly mediumService: MediumService) {}

  @ApiOperation({
    summary: "매체명 등록",
    operationId: "createMedium",
    tags: ["medium"],
  })
  @Post()
  async createMedium(@Body() dto: createMediumDto) {
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
}

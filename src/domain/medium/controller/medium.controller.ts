import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { MediumService } from "src/domain/medium/service/medium.service";
import { createMediumDto } from "src/domain/medium/dto/request/create-medium.dto";
import { ApiOperation } from "@nestjs/swagger";
import { GetMediumsDto } from "src/domain/medium/dto/response/get-medium.dto";
import { ModifyMediumDto } from "src/domain/medium/dto/request/modify-medium.dto";
import { ModifyMediumResultDto } from "src/domain/medium/dto/response/modify-medium-result.dto";

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
}

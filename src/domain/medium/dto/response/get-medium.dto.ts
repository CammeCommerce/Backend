import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class MediumDetailDto {
  @ApiProperty({ example: 1, description: "매체 ID" })
  id: number;

  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  name: string;

  @ApiProperty({ example: "2024-10-10", description: "등록일자" })
  createdAt: Date;
}

export class GetMediumsDto {
  @ApiProperty({ type: [MediumDetailDto], description: "매체 목록" })
  @Type(() => MediumDetailDto)
  items: MediumDetailDto[];
}

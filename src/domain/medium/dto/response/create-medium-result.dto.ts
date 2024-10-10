import { ApiProperty } from "@nestjs/swagger";

export class CreateMediumResultDto {
  @ApiProperty({ example: 1, description: "매체 ID" })
  id: number;

  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  name: string;

  @ApiProperty({ example: "2024-10-10", description: "등록일자" })
  createdAt: Date;
}

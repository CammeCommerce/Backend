import { ApiProperty } from "@nestjs/swagger";

export class ModifyMediumResultDto {
  @ApiProperty({ example: 1, description: "매체 ID" })
  id: number;

  @ApiProperty({ example: "포앤서치", description: "매체명" })
  name: string;

  @ApiProperty({ example: "2024-10-10", description: "수정일자" })
  updatedAt: Date;
}

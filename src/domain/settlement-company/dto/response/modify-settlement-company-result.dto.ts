import { ApiProperty } from "@nestjs/swagger";

export class ModifySettlementCompanyResultDto {
  @ApiProperty({ example: 1, description: "정산업체 ID" })
  id: number;

  @ApiProperty({
    example: "포앤>캄므_마진만",
    description: "수정된 정산업체명",
  })
  name: string;

  @ApiProperty({ example: "2024-10-10", description: "수정일자" })
  updatedAt: Date;
}

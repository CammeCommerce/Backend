import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class SettlementCompanyDetailDto {
  @ApiProperty({ example: 1, description: "정산업체 ID" })
  id: number;

  @ApiProperty({ example: "캄므>포앤_마진만", description: "정산업체명" })
  name: string;

  @ApiProperty({ example: "2024-10-10", description: "등록일자" })
  createdAt: Date;
}

export class GetSettlementCompaniesDto {
  @ApiProperty({
    type: [SettlementCompanyDetailDto],
    description: "정산업체 목록",
  })
  @Type(() => SettlementCompanyDetailDto)
  items: SettlementCompanyDetailDto[];
}

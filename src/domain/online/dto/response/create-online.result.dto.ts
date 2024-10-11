import { ApiProperty } from "@nestjs/swagger";

export class CreateOnlineResultDto {
  @ApiProperty({ example: 1, description: "온라인 ID" })
  id: number;

  @ApiProperty({ example: "2024-10", description: "매출 발생 월" })
  salesMonth: string;

  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  mediumName: string;

  @ApiProperty({ example: "온라인 매체명", description: "온라인 매체명" })
  onlineCompanyName: string;

  @ApiProperty({ example: 15000, description: "매출액" })
  salesAmount: number;

  @ApiProperty({ example: 20000, description: "매입액" })
  purchaseAmount: number;

  @ApiProperty({ example: 5000, description: "마진액" })
  marginAmount: number;

  @ApiProperty({ example: "메모", description: "메모" })
  memo: string;
}

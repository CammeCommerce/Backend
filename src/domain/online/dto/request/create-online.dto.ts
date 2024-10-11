import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateOnlineDto {
  @ApiProperty({ example: "2024-10", description: "매출 발생 월" })
  @IsString()
  salesMonth: string;

  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  @IsString()
  mediumName: string;

  @ApiProperty({ example: "온라인 매체명", description: "온라인 매체명" })
  @IsString()
  onlineCompanyName: string;

  @ApiProperty({ example: 15000, description: "매출액" })
  @IsInt()
  salesAmount: number;

  @ApiProperty({ example: 20000, description: "매입액" })
  @IsInt()
  purchaseAmount: number;

  @ApiProperty({ example: 5000, description: "마진액" })
  @IsInt()
  marginAmount: number;

  @ApiProperty({ example: "메모", description: "메모" })
  @IsString()
  memo: string;
}

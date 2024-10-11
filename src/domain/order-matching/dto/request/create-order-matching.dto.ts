import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateOrderMatchingDto {
  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  @IsString()
  mediumName: string;

  @ApiProperty({ example: "캄므>포앤_마진만", description: "정산업체명" })
  @IsString()
  settlementCompanyName: string;

  @ApiProperty({ example: "매입처", description: "매입처" })
  @IsString()
  purchasePlace: string;

  @ApiProperty({ example: "매출처", description: "매출처" })
  @IsString()
  salesPlace: string;
}

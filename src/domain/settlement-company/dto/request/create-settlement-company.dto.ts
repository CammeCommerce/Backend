import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateSettlementCompanyDto {
  @ApiProperty({ example: "캄므>포앤_마진만", description: "정산업체명" })
  @IsString()
  name: string;
}

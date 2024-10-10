import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ModifySettlementCompanyDto {
  @ApiProperty({
    example: "포앤>캄므_마진만",
    description: "수정할 정산업체명",
  })
  @IsString()
  name: string;
}

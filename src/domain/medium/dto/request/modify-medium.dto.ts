import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ModifyMediumDto {
  @ApiProperty({ example: "포앤서치", description: "수정할 매체명" })
  @IsString()
  name: string;
}

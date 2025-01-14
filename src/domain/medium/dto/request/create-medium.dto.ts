import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateMediumDto {
  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  @IsString()
  name: string;
}

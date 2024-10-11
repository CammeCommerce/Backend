import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class OrderMatchingDetailDto {
  @ApiProperty({ example: 1, description: "주문 매칭 ID" })
  id: number;

  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  mediumName: string;

  @ApiProperty({ example: "캄므>포앤_마진만", description: "정산업체명" })
  settlementCompanyName: string;

  @ApiProperty({ example: "매입처", description: "매입처" })
  purchasePlace: string;

  @ApiProperty({ example: "매출처", description: "매출처" })
  salesPlace: string;
}

export class GetOrderMatchingsDto {
  @ApiProperty({
    type: [OrderMatchingDetailDto],
    description: "주문 매칭 목록",
  })
  @Type(() => OrderMatchingDetailDto)
  items: OrderMatchingDetailDto[];
}

import { ApiProperty } from "@nestjs/swagger";

export class GetOrderTotalsDto {
  @ApiProperty({ example: 100000, description: "매입가의 총합계" })
  totalPurchasePrice: number;

  @ApiProperty({ example: 100000, description: "판매가의 총합계" })
  totalSalesPrice: number;

  @ApiProperty({ example: 100000, description: "매입 배송비의 총합계" })
  totalPurchaseShippingFee: number;

  @ApiProperty({ example: 100000, description: "매출 배송비의 총합계" })
  totalSalesShippingFee: number;

  @ApiProperty({ example: 100000, description: "마진액의 총합계" })
  totalMarginAmount: number;

  @ApiProperty({ example: 100000, description: "배송차액의 총합계" })
  totalShippingDifference: number;
}

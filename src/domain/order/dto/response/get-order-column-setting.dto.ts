import { ApiProperty } from "@nestjs/swagger";

export class GetOrderColumnIndexDto {
  @ApiProperty({ example: "A", description: "상품명 엑셀 열" })
  productNameIndex: string;

  @ApiProperty({ example: "B", description: "수량 엑셀 열" })
  quantityIndex: string;

  @ApiProperty({ example: "C", description: "발주일자 엑셀 열" })
  orderDateIndex: string;

  @ApiProperty({ example: "D", description: "매입처 엑셀 열" })
  purchasePlaceIndex: string;

  @ApiProperty({ example: "E", description: "매출처 엑셀 열" })
  salesPlaceIndex: string;

  @ApiProperty({ example: "F", description: "매입가 엑셀 열" })
  purchasePriceIndex: string;

  @ApiProperty({ example: "G", description: "판매가 엑셀 열" })
  salesPriceIndex: string;

  @ApiProperty({ example: "H", description: "매입 배송비 엑셀 열" })
  purchaseShippingFeeIndex: string;

  @ApiProperty({ example: "I", description: "매출 배송비 엑셀 열" })
  salesShippingFeeIndex: string;

  @ApiProperty({ example: "J", description: "과세여부 엑셀 열" })
  taxTypeIndex: string;
}

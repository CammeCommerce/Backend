import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UploadExcelDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "업로드할 엑셀 파일",
  })
  file: any;

  @ApiProperty({ example: "A", description: "상품명 열 인덱스" })
  @IsString()
  productNameIndex: string;

  @ApiProperty({ example: "B", description: "수량 열 인덱스" })
  @IsString()
  quantityIndex: string;

  @ApiProperty({ example: "C", description: "발주일자 열 인덱스" })
  @IsString()
  orderDateIndex: string;

  @ApiProperty({ example: "D", description: "매입처 열 인덱스" })
  @IsString()
  purchasePlaceIndex: string;

  @ApiProperty({ example: "E", description: "매출처 열 인덱스" })
  @IsString()
  salesPlaceIndex: string;

  @ApiProperty({ example: "F", description: "매입가 열 인덱스" })
  @IsString()
  purchasePriceIndex: string;

  @ApiProperty({ example: "G", description: "판매가 열 인덱스" })
  @IsString()
  salesPriceIndex: string;

  @ApiProperty({ example: "H", description: "매입 배송비 열 인덱스" })
  @IsString()
  purchaseShippingFeeIndex: string;

  @ApiProperty({ example: "I", description: "매출 배송비 열 인덱스" })
  @IsString()
  salesShippingFeeIndex: string;

  @ApiProperty({ example: "J", description: "과세여부 열 인덱스" })
  @IsString()
  taxTypeIndex: string;

  @ApiProperty({ example: "K", description: "마진액 열 인덱스" })
  @IsString()
  marginAmountIndex: string;

  @ApiProperty({ example: "L", description: "배송차액 열 인덱스 " })
  @IsString()
  shippingDifferenceIndex: string;
}

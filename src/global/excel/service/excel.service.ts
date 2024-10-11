import { Injectable, BadRequestException } from "@nestjs/common";
import * as XLSX from "xlsx";

@Injectable()
export class ExcelService {
  // 엑셀 열 이름을 숫자 인덱스로 변환
  private columnToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + column.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return index - 1;
  }

  // 엑셀 파일 파싱 및 열 인덱스 기반 데이터 추출
  async parseExcel(
    file: Express.Multer.File,
    productNameIndex: string,
    quantityIndex: string,
    orderDateIndex: string,
    purchasePlaceIndex: string,
    salesPlaceIndex: string,
    purchasePriceIndex: string,
    salesPriceIndex: string,
    purchaseShippingFeeIndex: string,
    salesShippingFeeIndex: string,
    taxTypeIndex: string,
    marginAmountIndex: string,
    shippingDifferenceIndex: string
  ): Promise<any[]> {
    // 엑셀 파일 파싱
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!jsonData || jsonData.length < 2) {
      throw new BadRequestException("엑셀 파일의 데이터가 유효하지 않습니다.");
    }

    // 엑셀 열 인덱스 문자열을 숫자 인덱스로 변환
    const productNameIdx = this.columnToIndex(productNameIndex);
    const quantityIdx = this.columnToIndex(quantityIndex);
    const orderDateIdx = this.columnToIndex(orderDateIndex);
    const purchasePlaceIdx = this.columnToIndex(purchasePlaceIndex);
    const salesPlaceIdx = this.columnToIndex(salesPlaceIndex);
    const purchasePriceIdx = this.columnToIndex(purchasePriceIndex);
    const salesPriceIdx = this.columnToIndex(salesPriceIndex);
    const purchaseShippingFeeIdx = this.columnToIndex(purchaseShippingFeeIndex);
    const salesShippingFeeIdx = this.columnToIndex(salesShippingFeeIndex);
    const taxTypeIdx = this.columnToIndex(taxTypeIndex);
    const marginAmountIdx = this.columnToIndex(marginAmountIndex);
    const shippingDifferenceIdx = this.columnToIndex(shippingDifferenceIndex);

    const orders = [];

    // 첫 번째 행(헤더)을 제외하고 각 데이터 행을 처리
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // parseInt를 사용하여 숫자 필드를 변환하고 NaN 발생 시 기본값 설정
      const quantity = parseInt(row[quantityIdx], 10) || 0;
      const purchasePrice = parseInt(row[purchasePriceIdx], 10) || 0;
      const salesPrice = parseInt(row[salesPriceIdx], 10) || 0;
      const purchaseShippingFee =
        parseInt(row[purchaseShippingFeeIdx], 10) || 0;
      const salesShippingFee = parseInt(row[salesShippingFeeIdx], 10) || 0;
      const marginAmount = parseInt(row[marginAmountIdx], 10) || 0;
      const shippingDifference = parseInt(row[shippingDifferenceIdx], 10) || 0;

      // 각 행의 값을 객체로 생성하여 orders 배열에 추가
      const order = {
        productName: row[productNameIdx],
        quantity,
        orderDate: row[orderDateIdx],
        purchasePlace: row[purchasePlaceIdx],
        salesPlace: row[salesPlaceIdx],
        purchasePrice,
        salesPrice,
        purchaseShippingFee,
        salesShippingFee,
        taxType: row[taxTypeIdx],
        marginAmount,
        shippingDifference,
      };

      // 각 필드에 유효한 값이 들어갔는지 확인하여 예외 처리
      if (
        isNaN(quantity) ||
        isNaN(purchasePrice) ||
        isNaN(salesPrice) ||
        isNaN(purchaseShippingFee) ||
        isNaN(salesShippingFee) ||
        isNaN(marginAmount) ||
        isNaN(shippingDifference)
      ) {
        throw new BadRequestException(
          `엑셀 파일의 숫자 필드 값이 유효하지 않습니다. 행 번호: ${i + 1}`
        );
      }

      orders.push(order);
    }

    return orders;
  }
}

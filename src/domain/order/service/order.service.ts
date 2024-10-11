import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/domain/order/entity/order.entity";
import { DeepPartial, Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import { TaxType } from "src/global/enum/tax-type.enum";
import {
  GetOrdersDto,
  OrderDetailDto,
} from "src/domain/order/dto/response/get-order.dto";
import { ModifyOrderDto } from "src/domain/order/dto/request/modify-order.dto";
import { ModifyOrderResultDto } from "src/domain/order/dto/response/modify-order-result.dto";
import * as XLSX from "xlsx";
import { OrderMatching } from "src/domain/order-matching/entity/order-matching.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderMatching)
    private readonly orderMatchingRepository: Repository<OrderMatching>
  ) {}

  // taxType 숫자 값을 문자열(과세, 면세)로 변환하는 메서드
  private convertTaxTypeToString(taxType: TaxType): string | undefined {
    switch (taxType) {
      case TaxType.TAXABLE:
        return "과세";
      case TaxType.NON_TAXABLE:
        return "면세";
      default:
        return undefined;
    }
  }

  // 엑셀 열 이름을 숫자 인덱스로 변환하는 메서드
  private columnToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + column.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return index - 1;
  }

  // 엑셀 파일 파싱 및 주문 데이터 저장 메서드
  async parseExcelAndSaveOrders(
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
  ): Promise<void> {
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
        mediumName: null,
        settleCompanyName: null,
      };

      // 매체명과 정산업체명이 비어 있을 경우, 매입처와 매출처를 기준으로 자동 매칭
      if (!order.mediumName || !order.settleCompanyName) {
        const matchedRecord = await this.orderMatchingRepository.findOne({
          where: {
            purchasePlace: order.purchasePlace,
            salesPlace: order.salesPlace,
          },
        });

        if (matchedRecord) {
          order.mediumName = matchedRecord.mediumName;
          order.settleCompanyName = matchedRecord.settlementCompanyName;
        }
      }

      orders.push(order);
    }

    // 파싱된 주문값 저장
    await this.saveParsedOrders(orders);
  }

  // 파싱된 주문값 등록
  async saveParsedOrders(parsedOrders: any[]): Promise<void> {
    for (const orderData of parsedOrders) {
      const orderEntity: DeepPartial<Order> = {
        ...orderData,
      };

      const order = this.orderRepository.create(orderEntity);
      await this.orderRepository.save(order);
    }
  }

  // 주문값 조회
  async getOrders(): Promise<GetOrdersDto> {
    const orders = await this.orderRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "DESC" },
    });

    if (!orders) {
      throw new NotFoundException("등록된 주문이 없습니다.");
    }

    const items = orders.map((order) =>
      plainToInstance(OrderDetailDto, {
        id: order.id,
        mediumName: order.mediumName,
        settleCompanyName: order.settleCompanyName,
        productName: order.productName,
        quantity: order.quantity,
        orderDate: order.orderDate,
        purchasePlace: order.purchasePlace,
        salesPlace: order.salesPlace,
        purchasePrice: order.purchasePrice,
        salesPrice: order.salesPrice,
        purchaseShippingFee: order.purchaseShippingFee,
        salesShippingFee: order.salesShippingFee,
        taxType: order.taxType,
        marginAmount: order.marginAmount,
        shippingDifference: order.shippingDifference,
      })
    );

    // 주문 배열 DTO 생성
    const orderItemsDto = new GetOrdersDto();
    orderItemsDto.items = items;

    return orderItemsDto;
  }

  // 주문값 수정
  async modifyOrder(
    id: number,
    dto: ModifyOrderDto
  ): Promise<ModifyOrderResultDto> {
    const order = await this.orderRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!order) {
      throw new NotFoundException("주문을 찾을 수 없습니다.");
    }

    // taxType을 문자열로 변환
    const taxTypeString = this.convertTaxTypeToString(dto.taxType);
    if (!taxTypeString) {
      throw new BadRequestException(`잘못된 taxType 값: ${dto.taxType}`);
    }

    order.mediumName = dto.mediumName;
    order.settleCompanyName = dto.settleCompanyName;
    order.productName = dto.productName;
    order.quantity = dto.quantity;
    order.orderDate = dto.orderDate;
    order.purchasePlace = dto.purchasePlace;
    order.salesPlace = dto.salesPlace;
    order.purchasePrice = dto.purchasePrice;
    order.salesPrice = dto.salesPrice;
    order.purchaseShippingFee = dto.purchaseShippingFee;
    order.salesShippingFee = dto.salesShippingFee;
    order.taxType = taxTypeString;
    order.marginAmount = dto.marginAmount;
    order.shippingDifference = dto.shippingDifference;
    order.updatedAt = new Date();

    await this.orderRepository.save(order);

    // 주문값 수정 결과 DTO 생성
    const modifyOrderResultDto = plainToInstance(ModifyOrderResultDto, {
      id: order.id,
      mediumName: order.mediumName,
      settleCompanyName: order.settleCompanyName,
      productName: order.productName,
      quantity: order.quantity,
      orderDate: order.orderDate,
      purchasePlace: order.purchasePlace,
      salesPlace: order.salesPlace,
      purchasePrice: order.purchasePrice,
      salesPrice: order.salesPrice,
      purchaseShippingFee: order.purchaseShippingFee,
      salesShippingFee: order.salesShippingFee,
      taxType: order.taxType,
      marginAmount: order.marginAmount,
      shippingDifference: order.shippingDifference,
    });

    return modifyOrderResultDto;
  }

  // 주문값 삭제
  async deleteOrder(id: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!order) {
      throw new NotFoundException("주문을 찾을 수 없습니다.");
    }

    order.deletedAt = new Date();
    order.isDeleted = true;

    await this.orderRepository.save(order);

    return;
  }
}

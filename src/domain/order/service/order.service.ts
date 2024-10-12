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
import {
  GetSortedOrdersDto,
  SortedOrderDetailDto,
} from "src/domain/order/dto/response/get-sorted-order.dto";

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
        isMediumMatched: false,
        isSettleCompanyMatched: false,
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
          order.isMediumMatched = !!order.mediumName;
          order.isSettleCompanyMatched = !!order.settleCompanyName;
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
        settlementCompanyName: order.settlementCompanyName,
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
        isMediumMatched: order.isMediumMatched,
        isSettlementCompanyMatched: order.isSettlementCompanyMatched,
      })
    );

    // 주문 배열 DTO 생성
    const orderItemsDto = new GetOrdersDto();
    orderItemsDto.items = items;

    return orderItemsDto;
  }

  // 주문 검색 및 필터링 로직
  async searchOrders(
    startDate: Date,
    endDate: Date,
    periodType: string,
    mediumName: string,
    isMediumMatched: any,
    settlementCompanyName: string,
    isSettlementCompanyMatched: any,
    searchQuery: string
  ): Promise<GetOrdersDto> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder("order")
      .where("order.isDeleted = false");

    // 발주일자 범위 검색 조건
    if (startDate && endDate) {
      queryBuilder.andWhere("order.orderDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    }

    // 매체명 매칭 여부 필터
    if (isMediumMatched !== undefined && isMediumMatched !== null) {
      const isMediumMatchedBoolean = isMediumMatched === "true";
      queryBuilder.andWhere("order.isMediumMatched = :isMediumMatched", {
        isMediumMatched: isMediumMatchedBoolean,
      });
    }

    // 매체명 검색 조건
    if (mediumName) {
      queryBuilder.andWhere("order.mediumName LIKE :mediumName", {
        mediumName: `%${mediumName}%`,
      });
    }

    // 정산업체명 매칭 여부 필터
    if (
      isSettlementCompanyMatched !== undefined &&
      isSettlementCompanyMatched !== null
    ) {
      const isSettlementCompanyMatchedBoolean =
        isSettlementCompanyMatched === "true";
      queryBuilder.andWhere(
        "order.isSettlementCompanyMatched = :isSettlementCompanyMatched",
        { isSettlementCompanyMatched: isSettlementCompanyMatchedBoolean }
      );
    }

    // 정산업체명 검색 조건
    if (settlementCompanyName) {
      queryBuilder.andWhere(
        "order.settlementCompanyName LIKE :settlementCompanyName",
        {
          settlementCompanyName: `%${settlementCompanyName}%`,
        }
      );
    }

    // 검색창에서 검색 (상품명, 구매처, 판매처 등)
    if (searchQuery) {
      queryBuilder.andWhere(
        "(order.productName LIKE :searchQuery OR order.purchasePlace LIKE :searchQuery OR order.salesPlace LIKE :searchQuery)",
        { searchQuery: `%${searchQuery}%` }
      );
    }

    // 기간 필터
    const now = new Date();
    switch (periodType) {
      case "어제":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        queryBuilder.andWhere("order.orderDate BETWEEN :start AND :end", {
          start: yesterday,
          end: now,
        });
        break;
      case "지난 3일":
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 3);
        queryBuilder.andWhere("order.orderDate BETWEEN :start AND :end", {
          start: threeDaysAgo,
          end: now,
        });
        break;
      case "일주일":
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        queryBuilder.andWhere("order.orderDate BETWEEN :start AND :end", {
          start: oneWeekAgo,
          end: now,
        });
        break;
      case "1개월":
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        queryBuilder.andWhere("order.orderDate BETWEEN :start AND :end", {
          start: oneMonthAgo,
          end: now,
        });
        break;
      case "3개월":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        queryBuilder.andWhere("order.orderDate BETWEEN :start AND :end", {
          start: threeMonthsAgo,
          end: now,
        });
        break;
      case "6개월":
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        queryBuilder.andWhere("order.orderDate BETWEEN :start AND :end", {
          start: sixMonthsAgo,
          end: now,
        });
        break;
      default:
        break;
    }

    const orders = await queryBuilder.getMany();

    if (!orders.length) {
      throw new NotFoundException("검색 조건에 맞는 주문이 없습니다.");
    }

    const items = orders.map((order) =>
      plainToInstance(OrderDetailDto, {
        id: order.id,
        mediumName: order.mediumName,
        settlementCompanyName: order.settlementCompanyName,
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
        isMediumMatched: order.isMediumMatched,
        isSettlementCompanyMatched: order.isSettlementCompanyMatched,
      })
    );

    const orderItemsDto = new GetOrdersDto();
    orderItemsDto.items = items;

    return orderItemsDto;
  }

  // 주문값 오름차순/내림차순 정렬
  async sortOrders(
    field: string,
    order: "asc" | "desc"
  ): Promise<GetSortedOrdersDto> {
    const validFields = [
      "mediumName",
      "settleCompanyName",
      "productName",
      "quantity",
      "orderDate",
      "purchasePlace",
      "salesPlace",
      "purchasePrice",
      "salesPrice",
      "purchaseShippingFee",
      "salesShippingFee",
      "taxType",
      "marginAmount",
      "shippingDifference",
    ];

    if (!validFields.includes(field)) {
      throw new BadRequestException(`잘못된 필드명입니다: ${field}`);
    }

    if (order !== "asc" && order !== "desc") {
      throw new BadRequestException(`잘못된 정렬 방식입니다: ${order}`);
    }

    const orders = await this.orderRepository.find({
      where: { isDeleted: false },
      order: {
        [field]: order.toUpperCase(),
      },
    });

    if (!orders.length) {
      throw new NotFoundException("등록된 주문이 없습니다.");
    }

    const items = orders.map((order) =>
      plainToInstance(SortedOrderDetailDto, {
        id: order.id,
        mediumName: order.mediumName,
        settlementCompanyName: order.settlementCompanyName,
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
        sortField: field,
        sortOrder: order,
      })
    );

    const sortedOrderItemsDto = new GetSortedOrdersDto();
    sortedOrderItemsDto.items = items;

    return sortedOrderItemsDto;
  }

  // 검색된 주문 데이터를 엑셀로 다운로드
  async downloadOrdersExcel(
    startDate: Date,
    endDate: Date,
    periodType: string,
    mediumName: string,
    isMediumMatched: any,
    settlementCompanyName: string,
    isSettlementCompanyMatched: any,
    searchQuery: string
  ): Promise<Buffer> {
    const ordersDto = await this.searchOrders(
      startDate,
      endDate,
      periodType,
      mediumName,
      isMediumMatched,
      settlementCompanyName,
      isSettlementCompanyMatched,
      searchQuery
    );

    const orders = ordersDto.items;

    // 엑셀에 포함할 필드만 추출
    const workbook = XLSX.utils.book_new();
    const worksheetData = orders.map((order) => ({
      매체명: order.mediumName,
      정산업체명: order.settlementCompanyName,
      상품명: order.productName,
      수량: order.quantity,
      발주일자: order.orderDate,
      매입처: order.purchasePlace,
      매출처: order.salesPlace,
      매입가: order.purchasePrice,
      판매가: order.salesPrice,
      "매입 배송비": order.purchaseShippingFee,
      "매출 배송비": order.salesShippingFee,
      과세여부: order.taxType,
      마진액: order.marginAmount,
      배송차액: order.shippingDifference,
    }));

    // 엑셀 데이터 생성
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // 엑셀 파일 버퍼 생성
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return excelBuffer;
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
    order.settlementCompanyName = dto.settlementCompanyName;
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
      settlementCompanyName: order.settlementCompanyName,
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

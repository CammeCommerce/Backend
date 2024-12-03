import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as XLSX from "xlsx";
import { Order } from "../entity/order.entity";
import { DeepPartial, In, Repository } from "typeorm";
import { OrderMatching } from "../../order-matching/entity/order-matching.entity";
import { OrderColumnIndex } from "../entity/order-column-index.entity";
import { TaxType } from "../../../global/enum/tax-type.enum";
import { GetOrderColumnIndexDto } from "../dto/response/get-order-column-index.dto";
import { plainToInstance } from "class-transformer";
import { GetOrdersDto, OrderDetailDto } from "../dto/response/get-order.dto";
import {
  GetSortedOrdersDto,
  SortedOrderDetailDto,
} from "../dto/response/get-sorted-order.dto";
import { ModifyOrderDto } from "../dto/request/modify-order.dto";
import { ModifyOrderResultDto } from "../dto/response/modify-order-result.dto";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderMatching)
    private readonly orderMatchingRepository: Repository<OrderMatching>,
    @InjectRepository(OrderColumnIndex)
    private readonly orderColumnIndexRepository: Repository<OrderColumnIndex>
  ) {}

  // taxType 숫자 값을 문자열(과세, 면세)로 변환하는 메서드
  private convertTaxTypeToString(taxType: TaxType): string | undefined {
    switch (taxType) {
      case TaxType.TAXABLE:
        return "11";
      case TaxType.NON_TAXABLE:
        return "12";
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

  // 파싱된 주문값을 저장하는 메서드
  async saveParsedOrders(parsedOrders: any[]): Promise<void> {
    for (const orderData of parsedOrders) {
      const orderEntity: DeepPartial<Order> = {
        ...orderData,
      };

      const order = this.orderRepository.create(orderEntity);
      await this.orderRepository.save(order);
    }
  }

  // 매체명과 정산업체명 매칭하는 메서드
  async matchOrders(): Promise<void> {
    const unmatchedOrders = await this.orderRepository.find({
      where: [
        { mediumName: null, isDeleted: false },
        { settlementCompanyName: null, isDeleted: false },
      ],
    });

    if (!unmatchedOrders.length) {
      return;
    }

    for (const order of unmatchedOrders) {
      const matchedRecord = await this.orderMatchingRepository.findOne({
        where: {
          purchasePlace: order.purchasePlace,
          salesPlace: order.salesPlace,
          isDeleted: false,
        },
        cache: false,
      });

      if (matchedRecord) {
        order.mediumName = matchedRecord.mediumName;
        order.settlementCompanyName = matchedRecord.settlementCompanyName;
        order.isMediumMatched = true;
        order.isSettlementCompanyMatched = true;

        await this.orderRepository.save(order);
      }
    }
  }

  // 열 인덱스 저장 메서드
  async saveOrderColumnIndex(
    columnIndexes: DeepPartial<OrderColumnIndex>
  ): Promise<void> {
    const existingIndexes = await this.orderColumnIndexRepository.find();
    if (existingIndexes && existingIndexes.length > 0) {
      await this.orderColumnIndexRepository.update(
        existingIndexes[0].id,
        columnIndexes
      );
    } else {
      await this.orderColumnIndexRepository.save(columnIndexes);
    }
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
    taxTypeIndex: string
  ): Promise<void> {
    // 엑셀 열 인덱스 저장
    const orderColumnIndexes: DeepPartial<OrderColumnIndex> = {
      productNameIndex,
      quantityIndex,
      orderDateIndex,
      purchasePlaceIndex,
      salesPlaceIndex,
      purchasePriceIndex,
      salesPriceIndex,
      purchaseShippingFeeIndex,
      salesShippingFeeIndex,
      taxTypeIndex,
    };

    // 열 인덱스 저장
    await this.saveOrderColumnIndex(orderColumnIndexes);

    // 엑셀 파일 파싱
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // if (!jsonData || jsonData.length < 2) {
    //   throw new BadRequestException("엑셀 파일의 데이터가 유효하지 않습니다.");
    // }

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

    const orders = [];

    // 첫 번째 행(헤더)을 제외하고 각 데이터 행을 처리
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // 공란 데이터 검증
      const missingFields = [];
      if (!row[purchasePlaceIdx]) missingFields.push("매입처");
      if (!row[salesPlaceIdx]) missingFields.push("매출처");

      if (missingFields.length > 0) {
        throw new BadRequestException(
          `엑셀 공란 값: ${missingFields.join(", ")} (${i + 1}행)`
        );
      }

      // parseInt를 사용하여 숫자 필드를 변환하고 NaN 발생 시 기본값 설정
      const quantity = parseInt(row[quantityIdx], 10) || 0;
      const purchasePrice = parseInt(row[purchasePriceIdx], 10) || 0;
      const salesPrice = parseInt(row[salesPriceIdx], 10) || 0;
      const purchaseShippingFee =
        parseInt(row[purchaseShippingFeeIdx], 10) || 0;
      const salesShippingFee = parseInt(row[salesShippingFeeIdx], 10) || 0;

      // 마진액과 배송차액 계산
      const marginAmount = salesPrice - purchasePrice;
      const shippingDifference = salesShippingFee - purchaseShippingFee;

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
        settlementCompanyName: null,
        isMediumMatched: false,
        isSettlementCompanyMatched: false,
      };

      // 매체명과 정산업체명이 비어 있을 경우, 매입처와 매출처를 기준으로 자동 매칭
      const matchedRecord = await this.orderMatchingRepository.findOne({
        where: {
          purchasePlace: order.purchasePlace,
          salesPlace: order.salesPlace,
          isDeleted: false,
        },
        cache: false,
      });

      if (matchedRecord) {
        order.mediumName = matchedRecord.mediumName;
        order.settlementCompanyName = matchedRecord.settlementCompanyName;
        order.isMediumMatched = true;
        order.isSettlementCompanyMatched = true;
      }

      orders.push(order);
    }

    // 파싱된 주문값 저장
    await this.saveParsedOrders(orders);

    // 주문 저장 후 매칭되지 않은 주문을 다시 확인하고 매칭하는 로직
    await this.matchOrders();
  }

  // 열 인덱스 조회 메서드
  async getOrderColumnIndex(): Promise<GetOrderColumnIndexDto> {
    const columnIndexes = await this.orderColumnIndexRepository.find();

    if (!columnIndexes || columnIndexes.length === 0) {
      throw new NotFoundException("저장된 열 인덱스가 없습니다.");
    }

    // 조회한 열 인덱스를 DTO로 변환하여 반환
    return plainToInstance(GetOrderColumnIndexDto, columnIndexes[0]);
  }

  // 주문값 조회
  async getOrders(): Promise<GetOrdersDto> {
    // 매칭되지 않은 주문들에 대해 매칭 로직을 수행
    // await this.matchOrders(); // 조회 시 매칭 로직 실행

    const orders = await this.orderRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "DESC" },
    });

    if (!orders.length) {
      throw new NotFoundException("등록된 주문이 없습니다.");
    }

    let totalPurchasePrice = 0;
    let totalSalesPrice = 0;
    let totalPurchaseShippingFee = 0;
    let totalSalesShippingFee = 0;
    let totalMarginAmount = 0;
    let totalShippingDifference = 0;

    const items = orders.map((order) => {
      totalPurchasePrice += order.purchasePrice;
      totalSalesPrice += order.salesPrice;
      totalPurchaseShippingFee += order.purchaseShippingFee;
      totalSalesShippingFee += order.salesShippingFee;
      totalMarginAmount += order.marginAmount;
      totalShippingDifference += order.shippingDifference;

      return plainToInstance(OrderDetailDto, {
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
      });
    });

    const orderItemsDto = new GetOrdersDto();
    orderItemsDto.items = items;
    orderItemsDto.totalPurchasePrice = totalPurchasePrice;
    orderItemsDto.totalSalesPrice = totalSalesPrice;
    orderItemsDto.totalPurchaseShippingFee = totalPurchaseShippingFee;
    orderItemsDto.totalSalesShippingFee = totalSalesShippingFee;
    orderItemsDto.totalMarginAmount = totalMarginAmount;
    orderItemsDto.totalShippingDifference = totalShippingDifference;

    return orderItemsDto;
  }

  // 주문 ID로 상세 조회 메서드
  async getOrderDetailById(id: number): Promise<OrderDetailDto> {
    const order = await this.orderRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!order) {
      throw new NotFoundException(`ID가 ${id}인 주문을 찾을 수 없습니다.`);
    }

    // 주문 데이터를 DTO로 변환
    return plainToInstance(OrderDetailDto, {
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
    });
  }

  // 주문 검색 및 필터링
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

    // 시작 날짜와 종료 날짜를 시간 없이 날짜만으로 비교
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "DATE(order.orderDate) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );
    } else if (startDate) {
      // 종료 날짜가 없을 때 시작 날짜로만 조회
      queryBuilder.andWhere("DATE(order.orderDate) = :startDate", {
        startDate: startDate.toISOString().split("T")[0],
      });
    }

    // 매체명 매칭 여부 필터
    if (
      isMediumMatched !== undefined &&
      isMediumMatched !== null &&
      isMediumMatched !== ""
    ) {
      const isMediumMatchedValue =
        String(isMediumMatched).toLowerCase() === "true" ||
        isMediumMatched === "1"
          ? 1
          : 0;
      queryBuilder.andWhere("order.isMediumMatched = :isMediumMatched", {
        isMediumMatched: isMediumMatchedValue,
      });
    }

    // 정산업체명 매칭 여부 필터
    if (
      isSettlementCompanyMatched !== undefined &&
      isSettlementCompanyMatched !== null &&
      isSettlementCompanyMatched !== ""
    ) {
      const isSettlementCompanyMatchedValue =
        String(isSettlementCompanyMatched).toLowerCase() === "true" ||
        isSettlementCompanyMatched === "1"
          ? 1
          : 0;
      queryBuilder.andWhere(
        "order.isSettlementCompanyMatched = :isSettlementCompanyMatched",
        { isSettlementCompanyMatched: isSettlementCompanyMatchedValue }
      );
    }

    // 매체명 검색 필터
    if (mediumName) {
      queryBuilder.andWhere("order.mediumName LIKE :mediumName", {
        mediumName: `%${mediumName}%`,
      });
    }

    // 정산업체명 검색 필터
    if (settlementCompanyName) {
      queryBuilder.andWhere(
        "order.settlementCompanyName = :settlementCompanyName",
        {
          settlementCompanyName,
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

    queryBuilder.orderBy("order.createdAt", "DESC");

    const orders = await queryBuilder.getMany();

    if (!orders.length) {
      throw new NotFoundException("검색 조건에 맞는 주문이 없습니다.");
    }

    let totalPurchasePrice = 0;
    let totalSalesPrice = 0;
    let totalPurchaseShippingFee = 0;
    let totalSalesShippingFee = 0;
    let totalMarginAmount = 0;
    let totalShippingDifference = 0;

    const items = orders.map((order) => {
      totalPurchasePrice += order.purchasePrice;
      totalSalesPrice += order.salesPrice;
      totalPurchaseShippingFee += order.purchaseShippingFee;
      totalSalesShippingFee += order.salesShippingFee;
      totalMarginAmount += order.marginAmount;
      totalShippingDifference += order.shippingDifference;

      return plainToInstance(OrderDetailDto, {
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
      });
    });

    const orderItemsDto = new GetOrdersDto();
    orderItemsDto.items = items;
    orderItemsDto.totalPurchasePrice = totalPurchasePrice;
    orderItemsDto.totalSalesPrice = totalSalesPrice;
    orderItemsDto.totalPurchaseShippingFee = totalPurchaseShippingFee;
    orderItemsDto.totalSalesShippingFee = totalSalesShippingFee;
    orderItemsDto.totalMarginAmount = totalMarginAmount;
    orderItemsDto.totalShippingDifference = totalShippingDifference;

    return orderItemsDto;
  }

  // 주문값 오름차순/내림차순 정렬
  async sortOrders(
    field: string,
    order: "asc" | "desc"
  ): Promise<GetSortedOrdersDto> {
    const validFields = [
      "id",
      "mediumName",
      "settlementCompanyName",
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
      })
    );

    const sortedOrderItemsDto = new GetSortedOrdersDto();
    sortedOrderItemsDto.items = items;
    sortedOrderItemsDto.sortField = field;
    sortedOrderItemsDto.sortOrder = order;

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

    // 각각의 필드를 개별적으로 수정 가능하게 설정
    order.mediumName = dto.mediumName ?? order.mediumName;
    order.settlementCompanyName =
      dto.settlementCompanyName ?? order.settlementCompanyName;
    order.productName = dto.productName ?? order.productName;
    order.quantity = dto.quantity ?? order.quantity;
    order.orderDate = dto.orderDate ?? order.orderDate;
    order.purchasePlace = dto.purchasePlace ?? order.purchasePlace;
    order.salesPlace = dto.salesPlace ?? order.salesPlace;
    order.purchasePrice = dto.purchasePrice ?? order.purchasePrice;
    order.salesPrice = dto.salesPrice ?? order.salesPrice;
    order.purchaseShippingFee =
      dto.purchaseShippingFee ?? order.purchaseShippingFee;
    order.salesShippingFee = dto.salesShippingFee ?? order.salesShippingFee;
    order.taxType = taxTypeString;
    order.updatedAt = new Date();

    // 마진액과 배송차액 계산
    order.marginAmount = order.salesPrice - order.purchasePrice;
    order.shippingDifference =
      order.salesShippingFee - order.purchaseShippingFee;

    order.isMediumMatched = !!order.isMediumMatched;
    order.isSettlementCompanyMatched = !!order.isSettlementCompanyMatched;

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
  async deleteOrders(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException("삭제할 주문 ID가 없습니다.");
    }

    const orders = await this.orderRepository.find({
      where: {
        id: In(ids),
        isDeleted: false,
      },
    });

    if (orders.length !== ids.length) {
      throw new NotFoundException("일부 주문을 찾을 수 없습니다.");
    }

    for (const order of orders) {
      order.deletedAt = new Date();
      order.isDeleted = true;
      await this.orderRepository.save(order);
    }

    return;
  }
}

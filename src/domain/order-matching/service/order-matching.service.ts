import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderMatching } from "src/domain/order-matching/entity/order-matching.entity";
import { In, Repository } from "typeorm";
import { CreateOrderMatchingDto } from "src/domain/order-matching/dto/request/create-order-matching.dto";
import { CreateOrderMatchingResultDto } from "src/domain/order-matching/dto/response/create-order-matching-result.dto";
import { plainToInstance } from "class-transformer";
import {
  GetOrderMatchingsDto,
  OrderMatchingDetailDto,
} from "src/domain/order-matching/dto/response/get-order-matching.dto";

@Injectable()
export class OrderMatchingService {
  constructor(
    @InjectRepository(OrderMatching)
    private readonly orderMatchingRepository: Repository<OrderMatching>
  ) {}

  // 주문 매칭 등록
  async createOrderMatching(
    dto: CreateOrderMatchingDto
  ): Promise<CreateOrderMatchingResultDto> {
    // 매입처와 매출처가 같은 주문 매칭이 있는지 중복 체크
    const existingMatching = await this.orderMatchingRepository.findOne({
      where: {
        purchasePlace: dto.purchasePlace,
        salesPlace: dto.salesPlace,
        isDeleted: false,
      },
    });

    if (existingMatching) {
      throw new ConflictException(
        `이미 매입처(${dto.purchasePlace})와 매출처(${dto.salesPlace})가 매칭된 데이터가 존재합니다.`
      );
    }

    const orderMatching = await this.orderMatchingRepository.create(dto);
    await this.orderMatchingRepository.save(orderMatching);

    // 주문 매칭 등록 결과 DTO 생성
    const createOrderMatchingDto = plainToInstance(
      CreateOrderMatchingResultDto,
      {
        id: orderMatching.id,
        mediumName: orderMatching.mediumName,
        settlementCompanyName: orderMatching.settlementCompanyName,
        purchasePlace: orderMatching.purchasePlace,
        salesPlace: orderMatching.salesPlace,
      }
    );

    return createOrderMatchingDto;
  }

  // 주문 매칭 조회
  async getOrderMatchings(): Promise<GetOrderMatchingsDto> {
    const orderMatching = await this.orderMatchingRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!orderMatching) {
      throw new NotFoundException("등록된 주문 매칭이 없습니다.");
    }

    const items = orderMatching.map((orderMatching) =>
      plainToInstance(OrderMatchingDetailDto, {
        id: orderMatching.id,
        mediumName: orderMatching.mediumName,
        settlementCompanyName: orderMatching.settlementCompanyName,
        purchasePlace: orderMatching.purchasePlace,
        salesPlace: orderMatching.salesPlace,
      })
    );

    // 주문 매칭 배열 DTO 생성
    const orderMatchingItemsDto = new GetOrderMatchingsDto();
    orderMatchingItemsDto.items = items;

    return orderMatchingItemsDto;
  }

  // 주문 매칭 검색 및 필터링
  async searchOrderMatchings(
    startDate: Date,
    endDate: Date,
    periodType: string,
    mediumName: string,
    settlementCompanyName: string,
    searchQuery: string
  ): Promise<GetOrderMatchingsDto> {
    const queryBuilder = this.orderMatchingRepository
      .createQueryBuilder("orderMatching")
      .where("orderMatching.isDeleted = false");

    // 매칭일자 범위 검색 조건
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "orderMatching.createdAt BETWEEN :startDate AND :endDate",
        { startDate, endDate }
      );
    }

    // 기간 필터
    const now = new Date();
    switch (periodType) {
      case "어제":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        queryBuilder.andWhere(
          "orderMatching.createdAt BETWEEN :start AND :end",
          {
            start: yesterday,
            end: now,
          }
        );
        break;
      case "지난 3일":
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 3);
        queryBuilder.andWhere(
          "orderMatching.createdAt BETWEEN :start AND :end",
          {
            start: threeDaysAgo,
            end: now,
          }
        );
        break;
      case "일주일":
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        queryBuilder.andWhere(
          "orderMatching.createdAt BETWEEN :start AND :end",
          {
            start: oneWeekAgo,
            end: now,
          }
        );
        break;
      case "1개월":
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        queryBuilder.andWhere(
          "orderMatching.createdAt BETWEEN :start AND :end",
          {
            start: oneMonthAgo,
            end: now,
          }
        );
        break;
      case "3개월":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        queryBuilder.andWhere(
          "orderMatching.createdAt BETWEEN :start AND :end",
          {
            start: threeMonthsAgo,
            end: now,
          }
        );
        break;
      case "6개월":
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        queryBuilder.andWhere(
          "orderMatching.createdAt BETWEEN :start AND :end",
          {
            start: sixMonthsAgo,
            end: now,
          }
        );
        break;
      default:
        break;
    }

    // 매체명 검색 조건
    if (mediumName) {
      queryBuilder.andWhere("orderMatching.mediumName LIKE :mediumName", {
        mediumName: `%${mediumName}%`,
      });
    }

    // 정산업체명 검색 조건
    if (settlementCompanyName) {
      queryBuilder.andWhere(
        "orderMatching.settlementCompanyName LIKE :settlementCompanyName",
        {
          settlementCompanyName: `%${settlementCompanyName}%`,
        }
      );
    }

    // 매입처 또는 매출처 검색 조건
    if (searchQuery) {
      queryBuilder.andWhere(
        "(orderMatching.purchasePlace LIKE :searchQuery OR orderMatching.salesPlace LIKE :searchQuery)",
        { searchQuery: `%${searchQuery}%` }
      );
    }

    const orderMatchings = await queryBuilder.getMany();

    if (!orderMatchings.length) {
      throw new NotFoundException("검색 조건에 맞는 주문 매칭이 없습니다.");
    }

    const items = orderMatchings.map((orderMatching) =>
      plainToInstance(OrderMatchingDetailDto, {
        id: orderMatching.id,
        mediumName: orderMatching.mediumName,
        settlementCompanyName: orderMatching.settlementCompanyName,
        purchasePlace: orderMatching.purchasePlace,
        salesPlace: orderMatching.salesPlace,
      })
    );

    const orderMatchingItemsDto = new GetOrderMatchingsDto();
    orderMatchingItemsDto.items = items;

    return orderMatchingItemsDto;
  }

  // 주문 매칭 삭제
  async deleteOrderMatchings(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException("삭제할 주문 매칭 ID가 없습니다.");
    }

    const orderMatchings = await this.orderMatchingRepository.find({
      where: {
        id: In(ids),
        isDeleted: false,
      },
    });

    if (orderMatchings.length !== ids.length) {
      throw new NotFoundException("일부 주문 매칭을 찾을 수 없습니다.");
    }

    for (const orderMatching of orderMatchings) {
      orderMatching.deletedAt = new Date();
      orderMatching.isDeleted = true;
      await this.orderMatchingRepository.save(orderMatching);
    }

    return;
  }
}

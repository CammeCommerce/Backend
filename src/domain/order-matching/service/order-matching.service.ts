import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderMatching } from "src/domain/order-matching/entity/order-matching.entity";
import { Repository } from "typeorm";
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

  // 주문 매칭 삭제
  async deleteOrderMatching(id: number): Promise<void> {
    const orderMatching = await this.orderMatchingRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!orderMatching) {
      throw new NotFoundException("주문 매칭을 찾을 수 없습니다.");
    }

    orderMatching.deletedAt = new Date();
    orderMatching.isDeleted = true;

    await this.orderMatchingRepository.save(orderMatching);

    return;
  }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderMatching } from "../entity/order-matching.entity";
import { Repository } from "typeorm";
import { CreateOrderMatchingDto } from "src/domain/order-matching/dto/request/create-order-matching.dto";
import { CreateOrderMatchingResultDto } from "src/domain/order-matching/dto/response/create-order-matching-result.dto";
import { plainToInstance } from "class-transformer";

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
}

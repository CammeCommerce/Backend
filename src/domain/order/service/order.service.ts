import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/domain/order/entity/order.entity";
import { DeepPartial, Repository } from "typeorm";
import { CreateOrderDto } from "src/domain/order/dto/request/create-order.dto";
import { CreateOrderResultDto } from "src/domain/order/dto/response/create-order.result.dto";
import { plainToInstance } from "class-transformer";
import { TaxType } from "src/global/enum/tax-type.enum";
import {
  GetOrdersDto,
  OrderDetailDto,
} from "src/domain/order/dto/response/get-order.dto";
import { ModifyOrderDto } from "src/domain/order/dto/request/modify-order.dto";
import { ModifyOrderResultDto } from "src/domain/order/dto/response/modify-order-result.dto";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>
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

  // TODO: 매체명 입력 시, 주문 매칭 리스트에 자동 입력 및 저장/매입처와 매출처가 같은 주문 건의 경우, 자동 매칭하기
  // 주문값 등록
  async createOrder(dto: CreateOrderDto): Promise<CreateOrderResultDto> {
    // taxType 숫자 값을 문자열로 변환
    const taxTypeString = this.convertTaxTypeToString(dto.taxType);
    if (taxTypeString === undefined) {
      throw new BadRequestException(`잘못된 taxType 값: ${dto.taxType}`);
    }

    // Order 엔티티 객체 생성 및 taxType 값 설정
    const orderEntity: DeepPartial<Order> = {
      ...dto,
      taxType: taxTypeString,
    };

    const order = this.orderRepository.create(orderEntity);

    // 마진액 및 배송차액 계산
    order.marginAmount = dto.salesPrice - dto.purchasePrice;
    order.shippingDifference = dto.salesShippingFee - dto.purchaseShippingFee;

    await this.orderRepository.save(order);

    // 주문값 등록 결과 DTO 생성
    const createOrderResultDto = plainToInstance(CreateOrderResultDto, {
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
      taxType: taxTypeString,
      marginAmount: order.marginAmount,
      shippingDifference: order.shippingDifference,
    });

    return createOrderResultDto;
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
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Medium } from "../entity/medium.entity";
import { Repository } from "typeorm";
import { Order } from "../../order/entity/order.entity";
import { Deposit } from "../../deposit/entity/deposit.entity";
import { Withdrawal } from "../../withdrawal/entity/withdrawal.entity";
import { CreateMediumDto } from "../dto/request/create-medium.dto";
import { CreateMediumResultDto } from "../dto/response/create-medium-result.dto";
import { plainToInstance } from "class-transformer";
import { GetMediumsDto, MediumDetailDto } from "../dto/response/get-medium.dto";
import { ModifyMediumDto } from "../dto/request/modify-medium.dto";
import { ModifyMediumResultDto } from "../dto/response/modify-medium-result.dto";

@Injectable()
export class MediumService {
  constructor(
    @InjectRepository(Medium)
    private readonly mediumRepository: Repository<Medium>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>
  ) {}

  // 매체명 등록
  async createMedium(dto: CreateMediumDto): Promise<CreateMediumResultDto> {
    const medium = this.mediumRepository.create(dto);
    await this.mediumRepository.save(medium);

    // 매체명 등록 결과 DTO 생성
    const createMediumResultDto = plainToInstance(CreateMediumResultDto, {
      id: medium.id,
      name: medium.name,
      createdAt: medium.createdAt,
    });

    return createMediumResultDto;
  }

  // 매체명 조회
  async getMediums(): Promise<GetMediumsDto> {
    const mediums = await this.mediumRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!mediums) {
      throw new NotFoundException("등록된 매체가 없습니다.");
    }

    const items = mediums.map((medium) =>
      plainToInstance(MediumDetailDto, {
        id: medium.id,
        name: medium.name,
        createdAt: medium.createdAt,
      })
    );

    // 매체 배열 DTO 생성
    const mediumItemsDto = new GetMediumsDto();
    mediumItemsDto.items = items;

    return mediumItemsDto;
  }

  // 매체명/등록일자 검색 및 기간 필터링
  async searchMediums(
    name: string,
    startDate: Date,
    endDate: Date,
    periodType: string
  ): Promise<GetMediumsDto> {
    // 기본 조회 조건
    const queryBuilder = this.mediumRepository
      .createQueryBuilder("medium")
      .where("medium.isDeleted = false");

    // 매체명 검색 조건 추가
    if (name) {
      queryBuilder.andWhere("medium.name LIKE :name", {
        name: `%${name}%`,
      });
    }

    // 기간 필터가 존재하는 경우 기간 필터를 우선 적용
    const now = new Date();
    let usePeriodFilter = false;
    switch (periodType) {
      case "어제":
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        queryBuilder.andWhere("medium.createdAt BETWEEN :start AND :end", {
          start: yesterday,
          end: now,
        });
        usePeriodFilter = true;
        break;
      case "지난 3일":
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(now.getDate() - 3);
        queryBuilder.andWhere("medium.createdAt BETWEEN :start AND :end", {
          start: threeDaysAgo,
          end: now,
        });
        usePeriodFilter = true;
        break;
      case "일주일":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        queryBuilder.andWhere("medium.createdAt BETWEEN :start AND :end", {
          start: oneWeekAgo,
          end: now,
        });
        usePeriodFilter = true;
        break;
      case "1개월":
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        queryBuilder.andWhere("medium.createdAt BETWEEN :start AND :end", {
          start: oneMonthAgo,
          end: now,
        });
        usePeriodFilter = true;
        break;
      case "3개월":
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        queryBuilder.andWhere("medium.createdAt BETWEEN :start AND :end", {
          start: threeMonthsAgo,
          end: now,
        });
        usePeriodFilter = true;
        break;
      case "6개월":
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        queryBuilder.andWhere("medium.createdAt BETWEEN :start AND :end", {
          start: sixMonthsAgo,
          end: now,
        });
        usePeriodFilter = true;
        break;
      default:
        break;
    }

    // 기간 필터가 없을 경우 등록일자 시작~종료를 조건으로 추가
    if (!usePeriodFilter && startDate && endDate) {
      queryBuilder.andWhere(
        "DATE(medium.createdAt) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );
    } else if (startDate) {
      // 종료 날짜가 없을 때 시작 날짜로만 조회
      queryBuilder.andWhere("DATE(medium.createdAt) = :startDate", {
        startDate: startDate.toISOString().split("T")[0],
      });
    }

    const mediums = await queryBuilder.getMany();

    if (!mediums.length) {
      throw new NotFoundException("검색 조건에 맞는 매체가 없습니다.");
    }

    const items = mediums.map((medium) =>
      plainToInstance(MediumDetailDto, {
        id: medium.id,
        name: medium.name,
        createdAt: medium.createdAt,
      })
    );

    const mediumItemsDto = new GetMediumsDto();
    mediumItemsDto.items = items;

    return mediumItemsDto;
  }

  // 매체명 수정
  async modifyMedium(
    id: number,
    dto: ModifyMediumDto
  ): Promise<ModifyMediumResultDto> {
    const medium = await this.mediumRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!medium) {
      throw new NotFoundException("매체를 찾을 수 없습니다.");
    }

    medium.name = dto.name;
    medium.updatedAt = new Date();

    await this.mediumRepository.save(medium);

    // 매체명 수정 결과 DTO 생성
    const modifyMediumResultDto = plainToInstance(ModifyMediumResultDto, {
      id: medium.id,
      name: medium.name,
      updatedAt: medium.updatedAt,
    });

    return modifyMediumResultDto;
  }

  // 매체명 삭제
  async deleteMedium(id: number): Promise<void> {
    const medium = await this.mediumRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!medium) {
      throw new NotFoundException("매체를 찾을 수 없습니다.");
    }

    // 단 1건이라도 매칭된 건이 있을 시, 삭제할 수 없도록 구현
    const isMatchedInOrder = await this.orderRepository.findOne({
      where: { mediumName: medium.name, isDeleted: false },
    });
    const isMatchedInDeposit = await this.depositRepository.findOne({
      where: { mediumName: medium.name, isDeleted: false },
    });
    const isMatchedInWithdrawal = await this.withdrawalRepository.findOne({
      where: { mediumName: medium.name, isDeleted: false },
    });

    if (isMatchedInOrder || isMatchedInDeposit || isMatchedInWithdrawal) {
      throw new BadRequestException(
        "매체명이 주문, 입금 또는 출금에서 사용되고 있어 삭제할 수 없습니다."
      );
    }

    medium.deletedAt = new Date();
    medium.isDeleted = true;

    await this.mediumRepository.save(medium);

    return;
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Online } from "src/domain/online/entity/online.entity";
import { Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import { CreateOnlineDto } from "src/domain/online/dto/request/create-online.dto";
import { CreateOnlineResultDto } from "src/domain/online/dto/response/create-online.result.dto";
import {
  GetOnlineDto,
  OnlineDetailDto,
} from "src/domain/online/dto/response/get-online.dto";
import { ModifyOnlineDto } from "src/domain/online/dto/request/modify-online.dto";
import { ModifyOnlineResultDto } from "src/domain/online/dto/response/modify-online-result.dto";

@Injectable()
export class OnlineService {
  constructor(
    @InjectRepository(Online)
    private readonly onlineRepository: Repository<Online>
  ) {}

  // 온라인(행) 등록
  async createOnline(dto: CreateOnlineDto): Promise<CreateOnlineResultDto> {
    const online = await this.onlineRepository.create(dto);
    await this.onlineRepository.save(online);

    // 온라인(행) 등록 결과 DTO 생성
    const createOnlineResultDto = plainToInstance(CreateOnlineResultDto, {
      id: online.id,
      salesMonth: online.salesMonth,
      mediumName: online.mediumName,
      onlineCompanyName: online.onlineCompanyName,
      salesAmount: online.salesAmount,
      purchaseAmount: online.purchaseAmount,
      marginAmount: online.marginAmount,
      memo: online.memo,
    });

    return createOnlineResultDto;
  }

  // 온라인 리스트 조회
  async getOnlines(): Promise<GetOnlineDto> {
    const onlines = await this.onlineRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!onlines) {
      throw new NotFoundException("등록된 온라인 리스트가 없습니다.");
    }

    const items = onlines.map((online) =>
      plainToInstance(OnlineDetailDto, {
        id: online.id,
        salesMonth: online.salesMonth,
        mediumName: online.mediumName,
        onlineCompanyName: online.onlineCompanyName,
        salesAmount: online.salesAmount,
        purchaseAmount: online.purchaseAmount,
        marginAmount: online.marginAmount,
        memo: online.memo,
      })
    );

    // 온라인 리스트 배열 DTO 생성
    const onlineItemsDto = new GetOnlineDto();
    onlineItemsDto.items = items;

    return onlineItemsDto;
  }

  // 온라인 검색 및 필터링
  async searchOnlines(
    startDate: Date,
    endDate: Date,
    periodType: string,
    mediumName: string,
    searchQuery: string
  ): Promise<GetOnlineDto> {
    const queryBuilder = this.onlineRepository
      .createQueryBuilder("online")
      .where("online.isDeleted = false");

    // 매출일자 범위 검색 조건
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "DATE_FORMAT(online.salesMonth, '%Y-%m') BETWEEN :startDate AND :endDate",
        { startDate, endDate }
      );
    }

    // 기간 필터
    const now = new Date();
    switch (periodType) {
      case "어제":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        queryBuilder.andWhere("online.salesMonth BETWEEN :start AND :end", {
          start: yesterday,
          end: now,
        });
        break;
      case "지난 3일":
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 3);
        queryBuilder.andWhere("online.salesMonth BETWEEN :start AND :end", {
          start: threeDaysAgo,
          end: now,
        });
        break;
      case "일주일":
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        queryBuilder.andWhere("online.salesMonth BETWEEN :start AND :end", {
          start: oneWeekAgo,
          end: now,
        });
        break;
      case "1개월":
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        queryBuilder.andWhere("online.salesMonth BETWEEN :start AND :end", {
          start: oneMonthAgo,
          end: now,
        });
        break;
      case "3개월":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        queryBuilder.andWhere("online.salesMonth BETWEEN :start AND :end", {
          start: threeMonthsAgo,
          end: now,
        });
        break;
      case "6개월":
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        queryBuilder.andWhere("online.salesMonth BETWEEN :start AND :end", {
          start: sixMonthsAgo,
          end: now,
        });
        break;
      default:
        break;
    }

    // 매체명 검색 조건
    if (mediumName) {
      queryBuilder.andWhere("online.mediumName LIKE :mediumName", {
        mediumName: `%${mediumName}%`,
      });
    }

    // 키워드 검색 조건
    if (searchQuery) {
      queryBuilder.andWhere(
        "(online.onlineCompanyName LIKE :searchQuery OR online.memo LIKE :searchQuery)",
        { searchQuery: `%${searchQuery}%` }
      );
    }

    const onlines = await queryBuilder.getMany();

    if (!onlines.length) {
      throw new NotFoundException("검색 조건에 맞는 온라인 데이터가 없습니다.");
    }

    const items = onlines.map((online) =>
      plainToInstance(OnlineDetailDto, {
        id: online.id,
        salesMonth: online.salesMonth,
        mediumName: online.mediumName,
        onlineCompanyName: online.onlineCompanyName,
        salesAmount: online.salesAmount,
        purchaseAmount: online.purchaseAmount,
        marginAmount: online.marginAmount,
        memo: online.memo,
      })
    );

    const onlineItemsDto = new GetOnlineDto();
    onlineItemsDto.items = items;

    return onlineItemsDto;
  }

  // 온라인(행) 수정
  async modifyOnline(
    id: number,
    dto: ModifyOnlineDto
  ): Promise<ModifyOnlineResultDto> {
    const online = await this.onlineRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!online) {
      throw new NotFoundException("온라인(행)을 찾을 수 없습니다.");
    }

    online.salesMonth = dto.salesMonth;
    online.mediumName = dto.mediumName;
    online.onlineCompanyName = dto.onlineCompanyName;
    online.salesAmount = dto.salesAmount;
    online.purchaseAmount = dto.purchaseAmount;
    online.marginAmount = dto.marginAmount;
    online.memo = dto.memo;
    online.updatedAt = new Date();

    await this.onlineRepository.save(online);

    const modifyOnlineResultDto = plainToInstance(ModifyOnlineResultDto, {
      id: online.id,
      salesMonth: online.salesMonth,
      mediumName: online.mediumName,
      onlineCompanyName: online.onlineCompanyName,
      salesAmount: online.salesAmount,
      purchaseAmount: online.purchaseAmount,
      marginAmount: online.marginAmount,
      memo: online.memo,
      updatedAt: online.updatedAt,
    });

    return modifyOnlineResultDto;
  }

  // 온라인(행) 삭제
  async deleteOnline(id: number): Promise<void> {
    const online = await this.onlineRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!online) {
      throw new NotFoundException("온라인(행)을 찾을 수 없습니다.");
    }

    online.deletedAt = new Date();
    online.isDeleted = true;

    await this.onlineRepository.save(online);

    return;
  }
}

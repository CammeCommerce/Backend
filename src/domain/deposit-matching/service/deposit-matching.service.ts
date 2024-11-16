import { InjectRepository } from "@nestjs/typeorm";
import { DepositMatching } from "../entity/deposit-matching.entity";
import { In, Repository } from "typeorm";
import { CreateDepositMatchingDto } from "../dto/request/create-deposit-matching.dto";
import { CreateDepositMatchingResultDto } from "../dto/response/create-deposit-matching-result.dto";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import {
  DepositMatchingDetailDto,
  GetDepositMatchingsDto,
} from "../dto/response/get-deposit-matching.dto";

export class DepositMatchingService {
  constructor(
    @InjectRepository(DepositMatching)
    private readonly depositMatchingRepository: Repository<DepositMatching>
  ) {}

  // 입금 매칭 등록
  async createDepositMatching(
    dto: CreateDepositMatchingDto
  ): Promise<CreateDepositMatchingResultDto> {
    // 계좌 별칭과 용도가 같은 입금 매칭이 있는지 중복 체크
    const existingMatching = await this.depositMatchingRepository.findOne({
      where: {
        accountAlias: dto.accountAlias,
        purpose: dto.purpose,
        isDeleted: false,
      },
    });

    if (existingMatching) {
      throw new ConflictException(
        `이미 계좌 별칭(${dto.accountAlias})과 용도(${dto.purpose})가 매칭된 데이터가 존재합니다.`
      );
    }

    const depositMatching = await this.depositMatchingRepository.create(dto);
    await this.depositMatchingRepository.save(depositMatching);

    // 입금 매칭 등록 결과 DTO 생성
    const createDepositMatchingDto = plainToInstance(
      CreateDepositMatchingResultDto,
      {
        id: depositMatching.id,
        mediumName: depositMatching.mediumName,
        accountAlias: depositMatching.accountAlias,
        purpose: depositMatching.purpose,
      }
    );

    return createDepositMatchingDto;
  }

  // 입금 매칭 조회
  async getDepositMatchings(): Promise<GetDepositMatchingsDto> {
    const depositMatchings = await this.depositMatchingRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!depositMatchings) {
      throw new NotFoundException("등록된 입금 매칭이 없습니다.");
    }

    const items = depositMatchings.map((depositMatching) =>
      plainToInstance(DepositMatchingDetailDto, {
        id: depositMatching.id,
        mediumName: depositMatching.mediumName,
        accountAlias: depositMatching.accountAlias,
        purpose: depositMatching.purpose,
      })
    );

    // 입금 매칭 배열 DTO 생성
    const depositMatchingItemsDto = new GetDepositMatchingsDto();
    depositMatchingItemsDto.items = items;

    return depositMatchingItemsDto;
  }

  // 입금 매칭 검색 및 필터링
  async searchDepositMatchings(
    startDate: Date,
    endDate: Date,
    periodType: string,
    mediumName: string,
    searchQuery: string
  ): Promise<GetDepositMatchingsDto> {
    const queryBuilder = this.depositMatchingRepository
      .createQueryBuilder("depositMatching")
      .where("depositMatching.isDeleted = false");

    // 매칭일자 범위 검색 조건
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "DATE(depositMatching.createdAt) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );
    } else if (startDate) {
      // 종료 날짜가 없을 때 시작 날짜로만 조회
      queryBuilder.andWhere("DATE(depositMatching.createdAt) = :startDate", {
        startDate: startDate.toISOString().split("T")[0],
      });
    }

    // 기간 필터
    const now = new Date();
    switch (periodType) {
      case "어제":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        queryBuilder.andWhere(
          "depositMatching.createdAt BETWEEN :start AND :end",
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
          "depositMatching.createdAt BETWEEN :start AND :end",
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
          "depositMatching.createdAt BETWEEN :start AND :end",
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
          "depositMatching.createdAt BETWEEN :start AND :end",
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
          "depositMatching.createdAt BETWEEN :start AND :end",
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
          "depositMatching.createdAt BETWEEN :start AND :end",
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
      queryBuilder.andWhere("depositMatching.mediumName LIKE :mediumName", {
        mediumName: `%${mediumName}%`,
      });
    }

    // 계좌 별칭 또는 용도 키워드 검색 조건
    if (searchQuery) {
      queryBuilder.andWhere(
        "(depositMatching.accountAlias LIKE :searchQuery OR depositMatching.purpose LIKE :searchQuery)",
        { searchQuery: `%${searchQuery}%` }
      );
    }

    const depositMatchings = await queryBuilder.getMany();

    if (!depositMatchings.length) {
      throw new NotFoundException("검색 조건에 맞는 입금 매칭이 없습니다.");
    }

    const items = depositMatchings.map((depositMatching) =>
      plainToInstance(DepositMatchingDetailDto, {
        id: depositMatching.id,
        mediumName: depositMatching.mediumName,
        accountAlias: depositMatching.accountAlias,
        purpose: depositMatching.purpose,
      })
    );

    const depositMatchingItemsDto = new GetDepositMatchingsDto();
    depositMatchingItemsDto.items = items;

    return depositMatchingItemsDto;
  }

  // 입금 매칭 삭제
  async deleteDepositMatchings(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException("삭제할 입금 매칭 ID가 없습니다.");
    }

    const depositMatchings = await this.depositMatchingRepository.find({
      where: {
        id: In(ids),
        isDeleted: false,
      },
    });

    if (depositMatchings.length !== ids.length) {
      throw new NotFoundException("일부 입금 매칭을 찾을 수 없습니다.");
    }

    for (const depositMatching of depositMatchings) {
      depositMatching.deletedAt = new Date();
      depositMatching.isDeleted = true;
      await this.depositMatchingRepository.save(depositMatching);
    }

    return;
  }
}

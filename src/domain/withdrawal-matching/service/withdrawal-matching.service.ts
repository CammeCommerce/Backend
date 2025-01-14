import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { WithdrawalMatching } from "../entity/withdrawal-matching.entity";
import { In, Repository } from "typeorm";
import { CreateWithdrawalMatchingDto } from "../dto/request/create-withdrawal-matching.dto";
import { CreateWithdrawalMatchingResultDto } from "../dto/response/create-withdrawal-matching-result.dto";
import {
  GetWithdrawalMatchingsDto,
  WithdrawalMatchingDetailDto,
} from "../dto/response/get-withdrawal-matching.dto";
import { WithdrawalService } from "../../withdrawal/service/withdrawal.service";

@Injectable()
export class WithdrawalMatchingService {
  constructor(
    @InjectRepository(WithdrawalMatching)
    private readonly withdrawalMatchingRepository: Repository<WithdrawalMatching>,
    private readonly withdrawalService: WithdrawalService
  ) {}

  // 출금 매칭 등록
  async createWithdrawalMatching(
    dto: CreateWithdrawalMatchingDto
  ): Promise<CreateWithdrawalMatchingResultDto> {
    // 매칭 등록 필수 값 확인 및 에러 처리
    if (!dto.accountAlias || dto.accountAlias.trim() === "") {
      throw new BadRequestException("계좌별칭 값이 공란입니다.");
    }
    if (!dto.purpose || dto.purpose.trim() === "") {
      throw new BadRequestException("용도 값이 공란입니다.");
    }
    if (!dto.mediumName || dto.mediumName.trim() === "") {
      throw new BadRequestException("매체명 값이 공란입니다.");
    }

    // 계좌 별칭과 용도가 같은 출금 매칭이 있는지 중복 체크
    const existingMatching = await this.withdrawalMatchingRepository.findOne({
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

    const withdrawalMatching =
      await this.withdrawalMatchingRepository.create(dto);
    await this.withdrawalMatchingRepository.save(withdrawalMatching);

    await this.withdrawalService.matchWithdrawals();

    // 출금 매칭 등록 결과 DTO 생성
    const createWithdrawalMatchingDto = plainToInstance(
      CreateWithdrawalMatchingResultDto,
      {
        id: withdrawalMatching.id,
        mediumName: withdrawalMatching.mediumName,
        accountAlias: withdrawalMatching.accountAlias,
        purpose: withdrawalMatching.purpose,
      }
    );

    return createWithdrawalMatchingDto;
  }

  // 출금 매칭 검색 및 필터링
  async searchWithdrawalMatchings(
    startDate: Date,
    endDate: Date,
    periodType: string,
    mediumName: string,
    searchQuery: string
  ): Promise<GetWithdrawalMatchingsDto> {
    const queryBuilder = this.withdrawalMatchingRepository
      .createQueryBuilder("withdrawalMatching")
      .where("withdrawalMatching.isDeleted = false");

    // 매칭일자 범위 검색 조건
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "DATE(withdrawalMatching.createdAt) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );
    } else if (startDate) {
      // 종료 날짜가 없을 때 시작 날짜로만 조회
      queryBuilder.andWhere("DATE(withdrawalMatching.createdAt) = :startDate", {
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
          "withdrawalMatching.createdAt BETWEEN :start AND :end",
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
          "withdrawalMatching.createdAt BETWEEN :start AND :end",
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
          "withdrawalMatching.createdAt BETWEEN :start AND :end",
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
          "withdrawalMatching.createdAt BETWEEN :start AND :end",
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
          "withdrawalMatching.createdAt BETWEEN :start AND :end",
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
          "withdrawalMatching.createdAt BETWEEN :start AND :end",
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
      queryBuilder.andWhere("withdrawalMatching.mediumName LIKE :mediumName", {
        mediumName: `%${mediumName}%`,
      });
    }

    // 계좌 별칭 또는 용도 키워드 검색 조건
    if (searchQuery) {
      queryBuilder.andWhere(
        "(withdrawalMatching.accountAlias LIKE :searchQuery OR withdrawalMatching.purpose LIKE :searchQuery)",
        { searchQuery: `%${searchQuery}%` }
      );
    }

    const withdrawalMatchings = await queryBuilder.getMany();

    if (!withdrawalMatchings.length) {
      throw new NotFoundException("검색 조건에 맞는 출금 매칭이 없습니다.");
    }

    const items = withdrawalMatchings.map((withdrawalMatching) =>
      plainToInstance(WithdrawalMatchingDetailDto, {
        id: withdrawalMatching.id,
        mediumName: withdrawalMatching.mediumName,
        accountAlias: withdrawalMatching.accountAlias,
        purpose: withdrawalMatching.purpose,
      })
    );

    const withdrawalMatchingItemsDto = new GetWithdrawalMatchingsDto();
    withdrawalMatchingItemsDto.items = items;

    return withdrawalMatchingItemsDto;
  }

  // 출금 매칭 조회
  async getWithdrawalMatchings(): Promise<GetWithdrawalMatchingsDto> {
    const withdrawalMatchings = await this.withdrawalMatchingRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!withdrawalMatchings) {
      throw new NotFoundException("등록된 출금 매칭이 없습니다.");
    }

    const items = withdrawalMatchings.map((withdrawalMatching) =>
      plainToInstance(WithdrawalMatchingDetailDto, {
        id: withdrawalMatching.id,
        mediumName: withdrawalMatching.mediumName,
        accountAlias: withdrawalMatching.accountAlias,
        purpose: withdrawalMatching.purpose,
      })
    );

    // 출금 매칭 배열 DTO 생성
    const withdrawalMatchingItemsDto = new GetWithdrawalMatchingsDto();
    withdrawalMatchingItemsDto.items = items;

    return withdrawalMatchingItemsDto;
  }

  // 출금 매칭 삭제
  async deleteWithdrawalMatchings(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException("삭제할 출금 매칭 ID가 없습니다.");
    }

    const withdrawalMatchings = await this.withdrawalMatchingRepository.find({
      where: {
        id: In(ids),
        isDeleted: false,
      },
    });

    if (withdrawalMatchings.length !== ids.length) {
      throw new NotFoundException("일부 출금 매칭을 찾을 수 없습니다.");
    }

    for (const withdrawalMatching of withdrawalMatchings) {
      withdrawalMatching.deletedAt = new Date();
      withdrawalMatching.isDeleted = true;
      await this.withdrawalMatchingRepository.save(withdrawalMatching);
    }

    return;
  }
}

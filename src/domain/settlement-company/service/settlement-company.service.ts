import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SettlementCompany } from "src/domain/settlement-company/entity/settlement-company.entity";
import { Repository } from "typeorm";
import { CreateSettlementCompanyDto } from "src/domain/settlement-company/dto/request/create-settlement-company.dto";
import { CreateSettlementCompanyResultDto } from "src/domain/settlement-company/dto/response/create-settlement-company-result.dto";
import { plainToInstance } from "class-transformer";
import {
  GetSettlementCompaniesDto,
  SettlementCompanyDetailDto,
} from "src/domain/settlement-company/dto/response/get-settlement-company.dto";
import { ModifySettlementCompanyDto } from "src/domain/settlement-company/dto/request/modify-settlement-company.dto";
import { ModifySettlementCompanyResultDto } from "src/domain/settlement-company/dto/response/modify-settlement-company-result.dto";

@Injectable()
export class SettlementCompanyService {
  constructor(
    @InjectRepository(SettlementCompany)
    private readonly settlementCompanyRepository: Repository<SettlementCompany>
  ) {}

  // 정산업체명 등록
  async createSettlementCompany(
    dto: CreateSettlementCompanyDto
  ): Promise<CreateSettlementCompanyResultDto> {
    const settlementCompany =
      await this.settlementCompanyRepository.create(dto);
    await this.settlementCompanyRepository.save(settlementCompany);

    // 정산업체명 등록 결과 DTO 생성
    const createSettlementCompanyResultDto = plainToInstance(
      CreateSettlementCompanyResultDto,
      {
        id: settlementCompany.id,
        name: settlementCompany.name,
        createdAt: settlementCompany.createdAt,
      }
    );

    return createSettlementCompanyResultDto;
  }

  // 정산업체명 조회
  async getSettlementCompanies(): Promise<GetSettlementCompaniesDto> {
    const settlementCompany = await this.settlementCompanyRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!settlementCompany) {
      throw new NotFoundException("등록된 정산업체가 없습니다.");
    }

    const items = settlementCompany.map((settlementCompany) =>
      plainToInstance(SettlementCompanyDetailDto, {
        id: settlementCompany.id,
        name: settlementCompany.name,
        createdAt: settlementCompany.createdAt,
      })
    );

    // 정산업체 배열 DTO 생성
    const settlementCompanyItemsDto = new GetSettlementCompaniesDto();
    settlementCompanyItemsDto.items = items;

    return settlementCompanyItemsDto;
  }

  // 정산업체명 검색 및 필터링
  async searchSettlementCompanies(
    name: string,
    startDate: Date,
    endDate: Date,
    periodType: string
  ): Promise<GetSettlementCompaniesDto> {
    const queryBuilder = this.settlementCompanyRepository
      .createQueryBuilder("settlementCompany")
      .where("settlementCompany.isDeleted = false");

    // 정산업체명 검색 조건 추가
    if (name) {
      queryBuilder.andWhere("settlementCompany.name LIKE :name", {
        name: `%${name}%`,
      });
    }

    // 기간 필터가 설정된 경우 기간 필터만 적용, 없으면 등록일자 필터 적용
    const now = new Date();
    if (periodType) {
      switch (periodType) {
        case "어제":
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          queryBuilder.andWhere(
            "settlementCompany.createdAt BETWEEN :start AND :end",
            {
              start: yesterday,
              end: now,
            }
          );
          break;
        case "지난 3일":
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(now.getDate() - 3);
          queryBuilder.andWhere(
            "settlementCompany.createdAt BETWEEN :start AND :end",
            {
              start: threeDaysAgo,
              end: now,
            }
          );
          break;
        case "일주일":
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          queryBuilder.andWhere(
            "settlementCompany.createdAt BETWEEN :start AND :end",
            {
              start: oneWeekAgo,
              end: now,
            }
          );
          break;
        case "1개월":
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          queryBuilder.andWhere(
            "settlementCompany.createdAt BETWEEN :start AND :end",
            {
              start: oneMonthAgo,
              end: now,
            }
          );
          break;
        case "3개월":
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          queryBuilder.andWhere(
            "settlementCompany.createdAt BETWEEN :start AND :end",
            {
              start: threeMonthsAgo,
              end: now,
            }
          );
          break;
        case "6개월":
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          queryBuilder.andWhere(
            "settlementCompany.createdAt BETWEEN :start AND :end",
            {
              start: sixMonthsAgo,
              end: now,
            }
          );
          break;
        default:
          break;
      }
    } else if (startDate && endDate) {
      // 기간 필터가 없을 경우에만 등록일자 필터 적용
      queryBuilder.andWhere(
        "settlementCompany.createdAt BETWEEN :startDate AND :endDate",
        {
          startDate,
          endDate,
        }
      );
    }

    const settlementCompanies = await queryBuilder.getMany();

    if (!settlementCompanies.length) {
      throw new NotFoundException("검색 조건에 맞는 정산업체가 없습니다.");
    }

    const items = settlementCompanies.map((settlementCompany) =>
      plainToInstance(SettlementCompanyDetailDto, {
        id: settlementCompany.id,
        name: settlementCompany.name,
        createdAt: settlementCompany.createdAt,
      })
    );

    const settlementCompanyItemsDto = new GetSettlementCompaniesDto();
    settlementCompanyItemsDto.items = items;

    return settlementCompanyItemsDto;
  }

  // 정산업체명 수정
  async modifySettlementCompany(
    id: number,
    dto: ModifySettlementCompanyDto
  ): Promise<ModifySettlementCompanyResultDto> {
    const settlementCompany = await this.settlementCompanyRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!settlementCompany) {
      throw new NotFoundException("정산업체를 찾을 수 없습니다.");
    }

    settlementCompany.name = dto.name;
    settlementCompany.updatedAt = new Date();

    await this.settlementCompanyRepository.save(settlementCompany);

    // 정산업체명 수정 결과 DTO 생성
    const modifySettlementCompanyResultDto = plainToInstance(
      ModifySettlementCompanyResultDto,
      {
        id: settlementCompany.id,
        name: settlementCompany.name,
        updatedAt: settlementCompany.updatedAt,
      }
    );

    return modifySettlementCompanyResultDto;
  }

  // TODO: 단 1건이라도 매칭된 건이 있을 시, 삭제할 수 없도록 구현
  // 정산업체명 삭제
  async deleteSettlementCompany(id: number): Promise<void> {
    const settlementCompany = await this.settlementCompanyRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!settlementCompany) {
      throw new NotFoundException("정산업체를 찾을 수 없습니다.");
    }

    settlementCompany.deletedAt = new Date();
    settlementCompany.isDeleted = true;

    await this.settlementCompanyRepository.save(settlementCompany);

    return;
  }
}

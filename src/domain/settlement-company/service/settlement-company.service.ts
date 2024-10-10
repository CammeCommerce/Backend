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
}

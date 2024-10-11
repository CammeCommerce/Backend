import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DepositMatching } from "src/domain/deposit-matching/entity/deposit-matching.entity";
import { Repository } from "typeorm";
import { CreateDepositMatchingResultDto } from "src/domain/deposit-matching/dto/response/create-deposit-matching-result.dto";
import { plainToInstance } from "class-transformer";
import { CreateDepositMatchingDto } from "src/domain/deposit-matching/dto/request/create-deposit-matching.dto";

@Injectable()
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
}

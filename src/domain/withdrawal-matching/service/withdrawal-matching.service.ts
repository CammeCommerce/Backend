import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WithdrawalMatching } from "src/domain/withdrawal-matching/entity/withdrawal-matching.entity";
import { Repository } from "typeorm";
import { CreateWithdrawalMatchingDto } from "src/domain/withdrawal-matching/dto/request/create-withdrawal-matching.dto";
import { CreateWithdrawalMatchingResultDto } from "src/domain/withdrawal-matching/dto/response/create-withdrawal-matching-result.dto";
import { plainToInstance } from "class-transformer";
import {
  GetWithdrawalMatchingsDto,
  WithdrawalMatchingDetailDto,
} from "src/domain/withdrawal-matching/dto/response/get-withdrawal-matching.dto";

@Injectable()
export class WithdrawalMatchingService {
  constructor(
    @InjectRepository(WithdrawalMatching)
    private readonly withdrawalMatchingRepository: Repository<WithdrawalMatching>
  ) {}

  // 출금 매칭 등록
  async createWithdrawalMatching(
    dto: CreateWithdrawalMatchingDto
  ): Promise<CreateWithdrawalMatchingResultDto> {
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
  async deleteWithdrawalMatching(id: number): Promise<void> {
    const withdrawalMatching = await this.withdrawalMatchingRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!withdrawalMatching) {
      throw new NotFoundException("출금 매칭을 찾을 수 없습니다.");
    }

    withdrawalMatching.deletedAt = new Date();
    withdrawalMatching.isDeleted = true;

    await this.withdrawalMatchingRepository.save(withdrawalMatching);

    return;
  }
}

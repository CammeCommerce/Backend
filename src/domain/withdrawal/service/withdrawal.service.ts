import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";
import { Repository } from "typeorm";
import { CreateWithdrawalDto } from "src/domain/withdrawal/dto/request/create-withdrawal.dto";
import { CreateWithdrawalResultDto } from "src/domain/withdrawal/dto/response/create-withdrawal-result.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>
  ) {}

  // 출금값 등록
  async createWithdrawal(
    dto: CreateWithdrawalDto
  ): Promise<CreateWithdrawalResultDto> {
    const withdrawal = await this.withdrawalRepository.create(dto);
    await this.withdrawalRepository.save(withdrawal);

    // 출금값 등록 결과 DTO 생성
    const createWithdrawalResultDto = plainToInstance(
      CreateWithdrawalResultDto,
      {
        id: withdrawal.id,
        mediumName: withdrawal.mediumName,
        withdrawalDate: withdrawal.withdrawalDate,
        accountAlias: withdrawal.accountAlias,
        withdrawalAmount: withdrawal.withdrawalAmount,
        accountDescription: withdrawal.accountDescription,
        transactionMethod1: withdrawal.transactionMethod1,
        transactionMethod2: withdrawal.transactionMethod2,
        accountMemo: withdrawal.accountMemo,
        purpose: withdrawal.purpose,
        clientName: withdrawal.clientName,
      }
    );

    return createWithdrawalResultDto;
  }
}

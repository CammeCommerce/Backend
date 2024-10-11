import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { Repository } from "typeorm";
import { CreateDepositDto } from "src/domain/deposit/dto/request/create-deposit.dto";
import { CreateDepositResultDto } from "src/domain/deposit/dto/response/create-deposit-result.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>
  ) {}

  // 입금값 등록
  async createDeposit(dto: CreateDepositDto): Promise<CreateDepositResultDto> {
    const deposit = await this.depositRepository.create(dto);
    await this.depositRepository.save(deposit);

    // 입금명 등록 결과 DTO 생성
    const createDepositResultDto = plainToInstance(CreateDepositResultDto, {
      id: deposit.id,
      mediumName: deposit.mediumName,
      depositDate: deposit.depositDate,
      accountAlias: deposit.accountAlias,
      depositAmount: deposit.depositAmount,
      accountDescription: deposit.accountDescription,
      transactionMethod1: deposit.transactionMethod1,
      transactionMethod2: deposit.transactionMethod2,
      accountMemo: deposit.accountMemo,
      counterpartyName: deposit.counterpartyName,
      purpose: deposit.purpose,
      clientName: deposit.clientName,
    });

    return createDepositResultDto;
  }
}

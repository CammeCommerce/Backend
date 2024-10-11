import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";
import { Repository } from "typeorm";
import { CreateWithdrawalDto } from "src/domain/withdrawal/dto/request/create-withdrawal.dto";
import { CreateWithdrawalResultDto } from "src/domain/withdrawal/dto/response/create-withdrawal-result.dto";
import { plainToInstance } from "class-transformer";
import {
  GetWithdrawalDto,
  WithdrawalDetailDto,
} from "src/domain/withdrawal/dto/response/get-withdrawal.dto";
import { ModifyWithdrawalDto } from "src/domain/withdrawal/dto/request/modify-withdrawal.dto";
import { ModifyWithdrawalResultDto } from "src/domain/withdrawal/dto/response/modify-withdrawal-result.dto";

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

  // 출금값 조회
  async getWithdrawals(): Promise<GetWithdrawalDto> {
    const withdrawals = await this.withdrawalRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!withdrawals) {
      throw new NotFoundException("등록된 출금값이 없습니다.");
    }

    const items = withdrawals.map((withdrawal) =>
      plainToInstance(WithdrawalDetailDto, {
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
      })
    );

    // 출금 배열 DTO 생성
    const withdrawalItemsDto = new GetWithdrawalDto();
    withdrawalItemsDto.items = items;

    return withdrawalItemsDto;
  }

  // 출금값 수정
  async modifyWithdrawal(
    id: number,
    dto: ModifyWithdrawalDto
  ): Promise<ModifyWithdrawalResultDto> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!withdrawal) {
      throw new NotFoundException("출금값을 찾을 수 없습니다.");
    }

    withdrawal.mediumName = dto.mediumName;
    withdrawal.withdrawalDate = dto.withdrawalDate;
    withdrawal.accountAlias = dto.accountAlias;
    withdrawal.withdrawalAmount = dto.withdrawalAmount;
    withdrawal.accountDescription = dto.accountDescription;
    withdrawal.transactionMethod1 = dto.transactionMethod1;
    withdrawal.transactionMethod2 = dto.transactionMethod2;
    withdrawal.accountMemo = dto.accountMemo;
    withdrawal.purpose = dto.purpose;
    withdrawal.clientName = dto.clientName;
    withdrawal.updatedAt = new Date();

    await this.withdrawalRepository.save(withdrawal);

    const modifyWithdrawalResultDto = plainToInstance(
      ModifyWithdrawalResultDto,
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
        updatedAt: withdrawal.updatedAt,
      }
    );

    return modifyWithdrawalResultDto;
  }
}

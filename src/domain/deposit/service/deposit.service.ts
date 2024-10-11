import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { Repository } from "typeorm";
import { CreateDepositDto } from "src/domain/deposit/dto/request/create-deposit.dto";
import { CreateDepositResultDto } from "src/domain/deposit/dto/response/create-deposit-result.dto";
import { plainToInstance } from "class-transformer";
import {
  DepositDetailDto,
  GetDepositsDto,
} from "src/domain/deposit/dto/response/get-deposit.dto";
import { ModifyDepositDto } from "src/domain/deposit/dto/request/modify-deposit.dto";
import { ModifyDepositResultDto } from "src/domain/deposit/dto/response/modify-deposit-result.dto";

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

    // 입금값 등록 결과 DTO 생성
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

  // 입금값 조회
  async getDeposits(): Promise<GetDepositsDto> {
    const deposits = await this.depositRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!deposits) {
      throw new NotFoundException("등록된 입금값이 없습니다.");
    }

    const items = deposits.map((deposit) =>
      plainToInstance(DepositDetailDto, {
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
      })
    );

    // 입금 배열 DTO 생성
    const depositItemsDto = new GetDepositsDto();
    depositItemsDto.items = items;

    return depositItemsDto;
  }

  // 입금값 수정
  async modifyDeposit(
    id: number,
    dto: ModifyDepositDto
  ): Promise<ModifyDepositResultDto> {
    const deposit = await this.depositRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!deposit) {
      throw new NotFoundException("입금값을 찾을 수 없습니다.");
    }

    deposit.mediumName = dto.mediumName;
    deposit.depositDate = dto.depositDate;
    deposit.accountAlias = dto.accountAlias;
    deposit.depositAmount = dto.depositAmount;
    deposit.accountDescription = dto.accountDescription;
    deposit.transactionMethod1 = dto.transactionMethod1;
    deposit.transactionMethod2 = dto.transactionMethod2;
    deposit.accountMemo = dto.accountMemo;
    deposit.counterpartyName = dto.counterpartyName;
    deposit.purpose = dto.purpose;
    deposit.clientName = dto.clientName;
    deposit.updatedAt = new Date();

    await this.depositRepository.save(deposit);

    const modifyDepositResultDto = plainToInstance(ModifyDepositResultDto, {
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
      updatedAt: deposit.updatedAt,
    });

    return modifyDepositResultDto;
  }

  // 입금값 삭제
  async deleteDeposit(id: number): Promise<void> {
    const deposit = await this.depositRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!deposit) {
      throw new NotFoundException("입금값을 찾을 수 없습니다.");
    }

    deposit.deletedAt = new Date();
    deposit.isDeleted = true;

    await this.depositRepository.save(deposit);

    return;
  }
}

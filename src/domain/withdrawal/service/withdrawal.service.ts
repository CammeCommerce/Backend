import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";
import { DeepPartial, Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import {
  GetWithdrawalDto,
  WithdrawalDetailDto,
} from "src/domain/withdrawal/dto/response/get-withdrawal.dto";
import { ModifyWithdrawalDto } from "src/domain/withdrawal/dto/request/modify-withdrawal.dto";
import { ModifyWithdrawalResultDto } from "src/domain/withdrawal/dto/response/modify-withdrawal-result.dto";
import { WithdrawalMatching } from "src/domain/withdrawal-matching/entity/withdrawal-matching.entity";
import * as XLSX from "xlsx";

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(WithdrawalMatching)
    private readonly withdrawalMatchingRepository: Repository<WithdrawalMatching>
  ) {}

  // 엑셀 열 이름을 숫자 인덱스로 변환하는 메서드
  private columnToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + column.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return index - 1;
  }

  // 엑셀 파일 파싱 및 출금값 저장 메서드
  async parseExcelAndSaveWithdrawals(
    file: Express.Multer.File,
    withdrawalDateIndex: string,
    accountAliasIndex: string,
    withdrawalAmountIndex: string,
    accountDescriptionIndex: string,
    transactionMethod1Index: string,
    transactionMethod2Index: string,
    accountMemoIndex: string,
    purposeIndex: string,
    clientNameIndex: string
  ): Promise<void> {
    // 엑셀 파일 파싱
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!jsonData || jsonData.length < 2) {
      throw new BadRequestException("엑셀 파일의 데이터가 유효하지 않습니다.");
    }

    // 엑셀 열 인덱스 문자열을 숫자 인덱스로 변환
    const withdrawalDateIdx = this.columnToIndex(withdrawalDateIndex);
    const accountAliasIdx = this.columnToIndex(accountAliasIndex);
    const withdrawalAmountIdx = this.columnToIndex(withdrawalAmountIndex);
    const accountDescriptionIdx = this.columnToIndex(accountDescriptionIndex);
    const transactionMethod1Idx = this.columnToIndex(transactionMethod1Index);
    const transactionMethod2Idx = this.columnToIndex(transactionMethod2Index);
    const accountMemoIdx = this.columnToIndex(accountMemoIndex);
    const purposeIdx = this.columnToIndex(purposeIndex);
    const clientNameIdx = this.columnToIndex(clientNameIndex);

    const withdrawals = [];

    // 첫 번째 행(헤더)을 제외하고 각 데이터 행을 처리
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // parseInt를 사용하여 숫자 필드를 변환하고 NaN 발생 시 기본값 설정
      const withdrawalAmount = parseInt(row[withdrawalAmountIdx], 10) || 0;

      const withdrawal = {
        mediumName: null,
        withdrawalDate: row[withdrawalDateIdx],
        accountAlias: row[accountAliasIdx],
        withdrawalAmount,
        accountDescription: row[accountDescriptionIdx],
        transactionMethod1: row[transactionMethod1Idx],
        transactionMethod2: row[transactionMethod2Idx],
        accountMemo: row[accountMemoIdx],
        purpose: row[purposeIdx],
        clientName: row[clientNameIdx],
      };

      // 매체명이 비어 있을 경우, 계좌별칭과 용도를 기준으로 자동 매칭
      if (!withdrawal.mediumName) {
        const matchedRecord = await this.withdrawalMatchingRepository.findOne({
          where: {
            accountAlias: withdrawal.accountAlias,
            purpose: withdrawal.purpose,
          },
        });

        if (matchedRecord) {
          withdrawal.mediumName = matchedRecord.mediumName;
        }
      }

      withdrawals.push(withdrawal);
    }

    // 파싱된 출금값 저장
    await this.saveParsedWithdrawals(withdrawals);
  }

  // 파싱된 출금값 등록
  async saveParsedWithdrawals(parsedWithdrawals: any[]): Promise<void> {
    for (const withdrawalData of parsedWithdrawals) {
      const withdrawalEntity: DeepPartial<Withdrawal> = {
        ...withdrawalData,
      };

      const withdrawal = this.withdrawalRepository.create(withdrawalEntity);
      await this.withdrawalRepository.save(withdrawal);
    }
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

  // 출금값 삭제
  async deleteWithdrawal(id: number): Promise<void> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!withdrawal) {
      throw new NotFoundException("출금값을 찾을 수 없습니다.");
    }

    withdrawal.deletedAt = new Date();
    withdrawal.isDeleted = true;

    await this.withdrawalRepository.save(withdrawal);

    return;
  }
}

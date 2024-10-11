import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { DeepPartial, Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import {
  DepositDetailDto,
  GetDepositsDto,
} from "src/domain/deposit/dto/response/get-deposit.dto";
import { ModifyDepositDto } from "src/domain/deposit/dto/request/modify-deposit.dto";
import { ModifyDepositResultDto } from "src/domain/deposit/dto/response/modify-deposit-result.dto";
import * as XLSX from "xlsx";

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>
  ) {}

  // 엑셀 열 이름을 숫자 인덱스로 변환하는 메서드
  private columnToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + column.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return index - 1;
  }

  // 엑셀 파일 파싱 및 입금값 저장 메서드
  async parseExcelAndSaveDeposits(
    file: Express.Multer.File,
    depositDateIndex: string,
    accountAliasIndex: string,
    depositAmountIndex: string,
    accountDescriptionIndex: string,
    transactionMethod1Index: string,
    transactionMethod2Index: string,
    accountMemoIndex: string,
    counterpartyNameIndex: string,
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
    const depositDateIdx = this.columnToIndex(depositDateIndex);
    const accountAliasIdx = this.columnToIndex(accountAliasIndex);
    const depositAmountIdx = this.columnToIndex(depositAmountIndex);
    const accountDescriptionIdx = this.columnToIndex(accountDescriptionIndex);
    const transactionMethod1Idx = this.columnToIndex(transactionMethod1Index);
    const transactionMethod2Idx = this.columnToIndex(transactionMethod2Index);
    const accountMemoIdx = this.columnToIndex(accountMemoIndex);
    const counterpartyNameIdx = this.columnToIndex(counterpartyNameIndex);
    const purposeIdx = this.columnToIndex(purposeIndex);
    const clientNameIdx = this.columnToIndex(clientNameIndex);

    const deposits = [];

    // 첫 번째 행(헤더)을 제외하고 각 데이터 행을 처리
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // parseInt를 사용하여 숫자 필드를 변환하고 NaN 발생 시 기본값 설정
      const depositAmount = parseInt(row[depositAmountIdx], 10) || 0;

      const deposit = {
        mediumName: null, // 초기에는 null로 설정하고, 추후에 매칭 도메인에서 처리
        depositDate: row[depositDateIdx],
        accountAlias: row[accountAliasIdx],
        depositAmount,
        accountDescription: row[accountDescriptionIdx],
        transactionMethod1: row[transactionMethod1Idx],
        transactionMethod2: row[transactionMethod2Idx],
        accountMemo: row[accountMemoIdx],
        counterpartyName: row[counterpartyNameIdx],
        purpose: row[purposeIdx],
        clientName: row[clientNameIdx],
      };

      deposits.push(deposit);
    }

    // 파싱된 입금값 저장
    await this.saveParsedDeposits(deposits);
  }

  // 파싱된 입금값 등록
  async saveParsedDeposits(parsedDeposits: any[]): Promise<void> {
    for (const depositData of parsedDeposits) {
      const depositEntity: DeepPartial<Deposit> = {
        ...depositData,
      };

      const deposit = this.depositRepository.create(depositEntity);
      await this.depositRepository.save(deposit);
    }
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

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
import { DepositMatching } from "src/domain/deposit-matching/entity/deposit-matching.entity";

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
    @InjectRepository(DepositMatching)
    private readonly depositMatchingRepository: Repository<DepositMatching>
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
        mediumName: null,
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
        isMediumMatched: false,
      };

      // 매체명이 비어 있을 경우 계좌 별칭과 용도를 기준으로 자동 매칭
      if (!deposit.mediumName) {
        const matchedRecord = await this.depositMatchingRepository.findOne({
          where: {
            accountAlias: deposit.accountAlias,
            purpose: deposit.purpose,
          },
        });

        if (matchedRecord) {
          deposit.mediumName = matchedRecord.mediumName;
          deposit.isMediumMatched = !!deposit.mediumName;
        }
      }

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
        isMediumMatched: deposit.isMediumMatched,
      })
    );

    // 입금 배열 DTO 생성
    const depositItemsDto = new GetDepositsDto();
    depositItemsDto.items = items;

    return depositItemsDto;
  }

  // 입금 검색 및 필터링
  async searchDeposits(
    startDate: Date,
    endDate: Date,
    periodType: string,
    mediumName: string,
    isMediumMatched: any,
    searchQuery: string
  ): Promise<GetDepositsDto> {
    const queryBuilder = this.depositRepository
      .createQueryBuilder("deposit")
      .where("deposit.isDeleted = false");

    // 발주일자 범위 검색 조건
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "deposit.depositDate BETWEEN :startDate AND :endDate",
        {
          startDate,
          endDate,
        }
      );
    }

    // 매체명 매칭 여부 필터
    if (isMediumMatched !== undefined && isMediumMatched !== null) {
      const isMediumMatchedBoolean = isMediumMatched === "true";
      queryBuilder.andWhere("deposit.isMediumMatched = :isMediumMatched", {
        isMediumMatched: isMediumMatchedBoolean,
      });
    }

    // 매체명 검색 조건
    if (mediumName) {
      queryBuilder.andWhere("deposit.mediumName LIKE :mediumName", {
        mediumName: `%${mediumName}%`,
      });
    }

    // 계좌별칭 또는 용도 검색 조건
    if (searchQuery) {
      queryBuilder.andWhere(
        "(deposit.accountAlias LIKE :searchQuery OR deposit.purpose LIKE :searchQuery)",
        { searchQuery: `%${searchQuery}%` }
      );
    }

    // 기간 필터
    const now = new Date();
    switch (periodType) {
      case "어제":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        queryBuilder.andWhere("deposit.depositDate BETWEEN :start AND :end", {
          start: yesterday,
          end: now,
        });
        break;
      case "지난 3일":
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 3);
        queryBuilder.andWhere("deposit.depositDate BETWEEN :start AND :end", {
          start: threeDaysAgo,
          end: now,
        });
        break;
      case "일주일":
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        queryBuilder.andWhere("deposit.depositDate BETWEEN :start AND :end", {
          start: oneWeekAgo,
          end: now,
        });
        break;
      case "1개월":
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        queryBuilder.andWhere("deposit.depositDate BETWEEN :start AND :end", {
          start: oneMonthAgo,
          end: now,
        });
        break;
      case "3개월":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        queryBuilder.andWhere("deposit.depositDate BETWEEN :start AND :end", {
          start: threeMonthsAgo,
          end: now,
        });
        break;
      case "6개월":
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        queryBuilder.andWhere("deposit.depositDate BETWEEN :start AND :end", {
          start: sixMonthsAgo,
          end: now,
        });
        break;
      default:
        break;
    }

    const deposits = await queryBuilder.getMany();

    if (!deposits.length) {
      throw new NotFoundException("검색 조건에 맞는 입금값이 없습니다.");
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
        isMediumMatched: deposit.isMediumMatched,
      })
    );

    const depositItemsDto = new GetDepositsDto();
    depositItemsDto.items = items;

    return depositItemsDto;
  }

  // 검색된 입금 데이터를 엑셀로 다운로드
  async downloadDepositsExcel(
    startDate: Date,
    endDate: Date,
    periodType: string,
    mediumName: string,
    isMediumMatched: any,
    searchQuery: string
  ): Promise<Buffer> {
    const depositDto = await this.searchDeposits(
      startDate,
      endDate,
      periodType,
      mediumName,
      isMediumMatched,
      searchQuery
    );

    // 엑셀에 포함할 필드만 추출
    const dataForExcel = depositDto.items.map((deposit) => ({
      매체명: deposit.mediumName,
      입금일자: deposit.depositDate,
      "계좌 별칭": deposit.accountAlias,
      입금액: deposit.depositAmount,
      "계좌 설명": deposit.accountDescription,
      "거래 수단1": deposit.transactionMethod1,
      "거래 수단2": deposit.transactionMethod2,
      "계좌 메모": deposit.accountMemo,
      "상대 계좌 예금주명": deposit.counterpartyName,
      용도: deposit.purpose,
      거래처: deposit.clientName,
    }));

    // 엑셀 데이터 생성
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deposits");

    // 엑셀 파일 버퍼 생성
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return excelBuffer;
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

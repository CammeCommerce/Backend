import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Deposit } from "../entity/deposit.entity";
import { DeepPartial, In, Repository } from "typeorm";
import { DepositMatching } from "../../deposit-matching/entity/deposit-matching.entity";
import { DepositColumnIndex } from "../entity/deposit-column-index.entity";
import { GetDepositColumnIndexDto } from "../dto/response/get-deposit-column-index.dto";
import { plainToInstance } from "class-transformer";
import {
  DepositDetailDto,
  GetDepositsDto,
} from "../dto/response/get-deposit.dto";
import { ModifyDepositDto } from "../dto/request/modify-deposit.dto";
import { ModifyDepositResultDto } from "../dto/response/modify-deposit-result.dto";
import * as XLSX from "xlsx";

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
    @InjectRepository(DepositMatching)
    private readonly depositMatchingRepository: Repository<DepositMatching>,
    @InjectRepository(DepositColumnIndex)
    private readonly depositColumnIndexRepository: Repository<DepositColumnIndex>
  ) {}

  // 엑셀 열 이름을 숫자 인덱스로 변환하는 메서드
  private columnToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + column.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return index - 1;
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

  // 매체명 매칭하는 메서드
  async matchDeposits(): Promise<void> {
    const unmatchedDeposits = await this.depositRepository.find({
      where: [{ mediumName: null, isDeleted: false }],
    });

    if (!unmatchedDeposits.length) {
      return;
    }

    for (const deposit of unmatchedDeposits) {
      const matchedRecord = await this.depositMatchingRepository
        .createQueryBuilder("depositMatching")
        .where("depositMatching.accountAlias = :accountAlias", {
          accountAlias: deposit.accountAlias,
        })
        .andWhere("depositMatching.purpose = :purpose", {
          purpose: deposit.purpose,
        })
        .andWhere("depositMatching.isDeleted = false")
        .getOne();

      console.log("Matched Record:", matchedRecord);

      if (matchedRecord) {
        deposit.mediumName = matchedRecord.mediumName;
        deposit.isMediumMatched = !!deposit.mediumName;

        await this.depositRepository.save(deposit);
      }
    }
  }

  // 열 인덱스 저장 메서드
  async saveDepositColumnIndex(
    columnIndexes: DeepPartial<DepositColumnIndex>
  ): Promise<void> {
    const existingIndexes = await this.depositColumnIndexRepository.find();
    if (existingIndexes && existingIndexes.length > 0) {
      await this.depositColumnIndexRepository.update(
        existingIndexes[0].id,
        columnIndexes
      );
    } else {
      await this.depositColumnIndexRepository.save(columnIndexes);
    }
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
    // 엑셀 열 인덱스 저장
    const depositColumnIndexes: DeepPartial<DepositColumnIndex> = {
      depositDateIdx: depositDateIndex,
      accountAliasIdx: accountAliasIndex,
      depositAmountIdx: depositAmountIndex,
      accountDescriptionIdx: accountDescriptionIndex,
      transactionMethod1Idx: transactionMethod1Index,
      transactionMethod2Idx: transactionMethod2Index,
      accountMemoIdx: accountMemoIndex,
      counterpartyNameIdx: counterpartyNameIndex,
      purposeIdx: purposeIndex,
      clientNameIdx: clientNameIndex,
    };

    // 열 인덱스 저장
    await this.saveDepositColumnIndex(depositColumnIndexes);

    // 엑셀 파일 파싱
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // if (!jsonData || jsonData.length < 2) {
    //   throw new BadRequestException("엑셀 파일의 데이터가 유효하지 않습니다.");
    // }

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

      // 공란 데이터 검증
      const missingFields = [];
      if (!row[accountAliasIdx]) missingFields.push("계좌별칭");
      if (!row[purposeIdx]) missingFields.push("용도");

      if (missingFields.length > 0) {
        throw new BadRequestException(
          `엑셀 공란 값: ${missingFields.join(", ")} (${i + 1}행)`
        );
      }

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
            isDeleted: false,
          },
          cache: false,
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

    // 입금 저장 후 매칭되지 않은 주문을 다시 확인하고 매칭하는 로직
    await this.matchDeposits();
  }

  // 열 인덱스 조회 메서드
  async getDepositColumnIndex(): Promise<GetDepositColumnIndexDto> {
    const columnIndexes = await this.depositColumnIndexRepository.find();

    if (!columnIndexes || columnIndexes.length === 0) {
      throw new NotFoundException("저장된 열 인덱스가 없습니다.");
    }

    // 조회한 열 인덱스를 DTO로 변환하여 반환
    return plainToInstance(GetDepositColumnIndexDto, columnIndexes[0]);
  }

  // 입금값 조회
  async getDeposits(): Promise<GetDepositsDto> {
    // 매칭되지 않은 입금들에 대해 매칭 로직을 수행
    // await this.matchDeposits();

    const deposits = await this.depositRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!deposits.length) {
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

  // 입금 ID로 상세 조회 메서드
  async getDepositDetailById(id: number): Promise<DepositDetailDto> {
    const deposit = await this.depositRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!deposit) {
      throw new NotFoundException(`ID가 ${id}인 입금값을 찾을 수 없습니다.`);
    }

    // 입금 데이터를 DTO로 변환
    return plainToInstance(DepositDetailDto, {
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
    });
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

    // 시작 날짜와 종료 날짜를 시간 없이 날짜만으로 비교
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "DATE(deposit.depositDate) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }
      );
    } else if (startDate) {
      // 종료 날짜가 없을 때 시작 날짜로만 조회
      queryBuilder.andWhere("DATE(deposit.depositDate) = :startDate", {
        startDate: startDate.toISOString().split("T")[0],
      });
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
      "계좌 적요": deposit.accountDescription,
      거래수단1: deposit.transactionMethod1,
      거래수단2: deposit.transactionMethod2,
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

    // 매칭 정보 해제 후, 독립적으로 필드 수정
    deposit.isMediumMatched = false;
    deposit.mediumName = dto.mediumName ?? deposit.mediumName;
    deposit.depositDate = dto.depositDate ?? deposit.depositDate;
    deposit.accountAlias = dto.accountAlias ?? deposit.accountAlias;
    deposit.depositAmount = dto.depositAmount ?? deposit.depositAmount;
    deposit.accountDescription =
      dto.accountDescription ?? deposit.accountDescription;
    deposit.transactionMethod1 =
      dto.transactionMethod1 ?? deposit.transactionMethod1;
    deposit.transactionMethod2 =
      dto.transactionMethod2 ?? deposit.transactionMethod2;
    deposit.accountMemo = dto.accountMemo ?? deposit.accountMemo;
    deposit.counterpartyName = dto.counterpartyName ?? deposit.counterpartyName;
    deposit.purpose = dto.purpose ?? deposit.purpose;
    deposit.clientName = dto.clientName ?? deposit.clientName;
    deposit.updatedAt = new Date();

    // 매칭 정보를 무시하고 독립적으로 현재 엔트리만 업데이트
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
  async deleteDeposits(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException("삭제할 입금 ID가 없습니다.");
    }

    const deposits = await this.depositRepository.find({
      where: {
        id: In(ids),
        isDeleted: false,
      },
    });

    if (deposits.length !== ids.length) {
      throw new NotFoundException("일부 입금값을 찾을 수 없습니다.");
    }

    for (const deposit of deposits) {
      deposit.deletedAt = new Date();
      deposit.isDeleted = true;
      await this.depositRepository.save(deposit);
    }

    return;
  }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/domain/order/entity/order.entity";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";
import { Online } from "src/domain/online/entity/online.entity";
import { Repository } from "typeorm";
import { GetProfitLossDto } from "src/domain/profit-loss/dto/response/get-profit-loss.dto";

@Injectable()
export class ProfitLossService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Online)
    private readonly onlineRepository: Repository<Online>
  ) {}

  // 손익계산서 데이터 검색 및 필터링
  async getProfitLoss(
    startDate: Date,
    endDate: Date,
    mediumName: string
  ): Promise<GetProfitLossDto> {
    const queryConditions = { startDate, endDate, mediumName };

    // 손익계산서 데이터 계산
    const wholesaleSales = await this.calculateWholesaleSales(queryConditions);
    const wholesaleShippingFee =
      await this.calculateWholesaleShippingFee(queryConditions);
    const depositByPurpose =
      await this.calculateDepositByPurpose(queryConditions);
    const onlineSalesByMedia = await this.calculateOnlineSales(queryConditions);
    const wholesalePurchase =
      await this.calculateWholesalePurchase(queryConditions);
    const wholesalePurchaseShippingFee =
      await this.calculateWholesalePurchaseShippingFee(queryConditions);
    const withdrawalByPurpose =
      await this.calculateWithdrawalByPurpose(queryConditions);
    const onlinePurchaseByMedia =
      await this.calculateOnlinePurchase(queryConditions);

    return {
      medium: mediumName,
      period: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")} ~ ${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}`,
      wholesaleSales,
      wholesaleShippingFee,
      depositByPurpose,
      onlineSalesByMedia,
      wholesalePurchase,
      wholesalePurchaseShippingFee,
      withdrawalByPurpose,
      onlinePurchaseByMedia,
    };
  }

  // 도매 매출 계산
  private async calculateWholesaleSales(queryConditions: any): Promise<number> {
    const { startDate, endDate, mediumName } = queryConditions;
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("SUM(order.salesPrice)", "total")
      .where("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .getRawOne();

    return result.total || 0;
  }

  // 도매 배송비 계산
  private async calculateWholesaleShippingFee(
    queryConditions: any
  ): Promise<number> {
    const { startDate, endDate, mediumName } = queryConditions;
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("SUM(order.salesShippingFee)", "total")
      .where("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .getRawOne();

    return result.total || 0;
  }

  // 입금 내역 용도별로 계산
  private async calculateDepositByPurpose(
    queryConditions: any
  ): Promise<Record<string, number>> {
    const { startDate, endDate, mediumName } = queryConditions;
    const deposits = await this.depositRepository
      .createQueryBuilder("deposit")
      .select(["deposit.purpose", "SUM(deposit.depositAmount) AS total"])
      .where("deposit.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("deposit.mediumName = :mediumName", { mediumName })
      .groupBy("deposit.purpose")
      .getRawMany();

    return deposits.reduce((acc, curr) => {
      acc[curr.purpose || "기타"] = parseInt(curr.total, 10);
      return acc;
    }, {});
  }

  // 온라인 매체별 매출 계산
  private async calculateOnlineSales(
    queryConditions: any
  ): Promise<Record<string, number>> {
    const { startDate, endDate, mediumName } = queryConditions;
    const sales = await this.onlineRepository
      .createQueryBuilder("online")
      .select(["online.mediumName", "SUM(online.salesAmount) AS total"])
      .where("online.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("online.mediumName = :mediumName", { mediumName })
      .groupBy("online.mediumName")
      .getRawMany();

    return sales.reduce((acc, curr) => {
      acc[curr.mediumName || "기타"] = parseInt(curr.total, 10);
      return acc;
    }, {});
  }

  // 도매 매입 계산
  private async calculateWholesalePurchase(
    queryConditions: any
  ): Promise<number> {
    const { startDate, endDate, mediumName } = queryConditions;
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("SUM(order.purchasePrice)", "total")
      .where("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .getRawOne();

    return result.total || 0;
  }

  // 도매 매입 배송비 계산
  private async calculateWholesalePurchaseShippingFee(
    queryConditions: any
  ): Promise<number> {
    const { startDate, endDate, mediumName } = queryConditions;
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("SUM(order.purchaseShippingFee)", "total")
      .where("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .getRawOne();

    return result.total || 0;
  }

  // 출금 내역 용도별로 계산
  private async calculateWithdrawalByPurpose(
    queryConditions: any
  ): Promise<Record<string, number>> {
    const { startDate, endDate, mediumName } = queryConditions;
    const withdrawals = await this.withdrawalRepository
      .createQueryBuilder("withdrawal")
      .select([
        "withdrawal.purpose",
        "SUM(withdrawal.withdrawalAmount) AS total",
      ])
      .where("withdrawal.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("withdrawal.mediumName = :mediumName", { mediumName })
      .groupBy("withdrawal.purpose")
      .getRawMany();

    return withdrawals.reduce((acc, curr) => {
      acc[curr.purpose || "기타"] = parseInt(curr.total, 10);
      return acc;
    }, {});
  }

  // 온라인 매입액 매체별로 계산
  private async calculateOnlinePurchase(
    queryConditions: any
  ): Promise<Record<string, number>> {
    const { startDate, endDate, mediumName } = queryConditions;
    const purchases = await this.onlineRepository
      .createQueryBuilder("online")
      .select(["online.mediumName", "SUM(online.purchaseAmount) AS total"])
      .where("online.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("online.mediumName = :mediumName", { mediumName })
      .groupBy("online.mediumName")
      .getRawMany();

    return purchases.reduce((acc, curr) => {
      acc[curr.mediumName || "기타"] = parseInt(curr.total, 10);
      return acc;
    }, {});
  }
}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "src/domain/order/entity/order.entity";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";
import { Online } from "src/domain/online/entity/online.entity";
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

  async getProfitLoss(
    startDate: Date,
    endDate: Date,
    mediumName: string
  ): Promise<GetProfitLossDto> {
    const queryConditions = { startDate, endDate, mediumName };

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

    // 총 매출 합계
    let totalSales = 0;
    totalSales += wholesaleSales;
    totalSales += wholesaleShippingFee;
    totalSales += Object.values(depositByPurpose).reduce((a, b) => a + b, 0);
    totalSales += Object.values(onlineSalesByMedia).reduce((a, b) => a + b, 0);

    // 총 매입 합계
    let totalPurchases = 0;
    totalPurchases += wholesalePurchase;
    totalPurchases += wholesalePurchaseShippingFee;
    totalPurchases += Object.values(withdrawalByPurpose).reduce(
      (a, b) => a + b,
      0
    );
    totalPurchases += Object.values(onlinePurchaseByMedia).reduce(
      (a, b) => a + b,
      0
    );

    // 당기 순이익(순손실) 계산
    const netProfitOrLoss = totalSales - totalPurchases;

    return {
      mediumName: mediumName,
      period: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")} ~ ${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}`,
      wholesaleSales,
      wholesaleShippingFee,
      depositByPurpose,
      onlineSalesByMedia,
      wholesalePurchase,
      wholesalePurchaseShippingFee,
      withdrawalByPurpose,
      onlinePurchaseByMedia,
      netProfitOrLoss,
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
      .andWhere("order.isMediumMatched = true")
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .getRawOne();

    return parseInt(result.total) || 0;
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
      .andWhere("order.isMediumMatched = true")
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  // 입금 내역 용도별로 계산
  private async calculateDepositByPurpose(
    queryConditions: any
  ): Promise<Record<string, number>> {
    const { startDate, endDate, mediumName } = queryConditions;
    const deposits = await this.depositRepository
      .createQueryBuilder("deposit")
      .select([
        "deposit.purpose AS purpose",
        "SUM(deposit.depositAmount) AS total",
      ])
      .where("deposit.depositDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("deposit.isMediumMatched = true")
      .andWhere("deposit.mediumName = :mediumName", { mediumName })
      .groupBy("deposit.purpose")
      .getRawMany();

    return deposits.reduce((acc, curr) => {
      acc[curr.purpose || "Unknown"] = parseInt(curr.total, 10);
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
      .select([
        "online.mediumName AS mediumName",
        "SUM(online.salesAmount) AS total",
      ])
      .where("online.salesMonth BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("online.mediumName = :mediumName", { mediumName })
      .groupBy("online.mediumName")
      .getRawMany();

    return sales.reduce((acc, curr) => {
      acc[curr.mediumName || "Unknown"] = parseInt(curr.total, 10);
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
      .andWhere("order.isMediumMatched = true")
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .getRawOne();

    return parseInt(result.total) || 0;
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
      .andWhere("order.isMediumMatched = true")
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  // 출금 내역 용도별로 계산
  private async calculateWithdrawalByPurpose(
    queryConditions: any
  ): Promise<Record<string, number>> {
    const { startDate, endDate, mediumName } = queryConditions;
    const withdrawals = await this.withdrawalRepository
      .createQueryBuilder("withdrawal")
      .select([
        "withdrawal.purpose AS purpose",
        "SUM(withdrawal.withdrawalAmount) AS total",
      ])
      .where("withdrawal.withdrawalDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("withdrawal.isMediumMatched = true")
      .andWhere("withdrawal.mediumName = :mediumName", { mediumName })
      .groupBy("withdrawal.purpose")
      .getRawMany();

    return withdrawals.reduce((acc, curr) => {
      acc[curr.purpose || "Unknown"] = parseInt(curr.total, 10);
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
      .select([
        "online.mediumName AS mediumName",
        "SUM(online.purchaseAmount) AS total",
      ])
      .where("online.salesMonth BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("online.mediumName = :mediumName", { mediumName })
      .groupBy("online.mediumName")
      .getRawMany();

    return purchases.reduce((acc, curr) => {
      acc[curr.mediumName || "Unknown"] = parseInt(curr.total, 10);
      return acc;
    }, {});
  }
}

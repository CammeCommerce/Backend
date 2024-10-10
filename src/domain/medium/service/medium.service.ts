import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Medium } from "src/domain/medium/entity/medium.entity";
import { Repository } from "typeorm";
import { createMediumDto } from "src/domain/medium/dto/request/create-medium.dto";
import { CreateMediumResultDto } from "src/domain/medium/dto/response/create-medium-result.dto";
import { plainToInstance } from "class-transformer";
import {
  GetMediumsDto,
  MediumDetailDto,
} from "src/domain/medium/dto/response/get-medium.dto";

@Injectable()
export class MediumService {
  constructor(
    @InjectRepository(Medium)
    private readonly mediumRepository: Repository<Medium>
  ) {}

  // 매체명 등록
  async createMedium(dto: createMediumDto): Promise<CreateMediumResultDto> {
    const medium = this.mediumRepository.create(dto);
    await this.mediumRepository.save(medium);

    // 매체명 등록 결과 DTO 생성
    const createMediumResultDto = plainToInstance(CreateMediumResultDto, {
      id: medium.id,
      name: medium.name,
      createdAt: medium.createdAt,
    });

    return createMediumResultDto;
  }

  // 매체명 조회
  async getMediums(): Promise<GetMediumsDto> {
    const mediums = await this.mediumRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!mediums) {
      throw new NotFoundException("등록된 매체가 없습니다.");
    }

    const items = mediums.map((medium) =>
      plainToInstance(MediumDetailDto, {
        id: medium.id,
        name: medium.name,
        createdAt: medium.createdAt,
      })
    );

    // 매체 배열 DTO 생성
    const mediumItemsDto = new GetMediumsDto();
    mediumItemsDto.items = items;

    return mediumItemsDto;
  }
}

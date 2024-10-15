import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/domain/user/entity/user.entity";
import { Repository } from "typeorm";
import { UserLoginDto } from "src/domain/user/dto/request/user-login.dto";
import { plainToInstance } from "class-transformer";
import { UserLoginResultDto } from "src/domain/user/dto/response/user-login-result.dto";
import { AuthService } from "src/domain/auth/auth.service";
import { UpdatePasswordDto } from "src/domain/user/dto/request/update-password.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService
  ) {}

  // 유저 로그인
  async loginUser(dto: UserLoginDto): Promise<UserLoginResultDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email, password: dto.password },
    });

    if (!user) {
      throw new NotFoundException("관리자를 찾을 수 없습니다.");
    }

    this.authService.loginSuccess();

    return plainToInstance(UserLoginResultDto, {
      id: user.id,
      message: "로그인에 성공했습니다.",
    });
  }

  // 이메일 발송
  async sendEmailVerification(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException("해당 이메일의 유저를 찾을 수 없습니다.");
    }

    this.authService.sendEmailVerification(email);
  }

  // 이메일 검증
  async verifyEmail(email: string, code: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException("해당 이메일의 유저를 찾을 수 없습니다.");
    }

    if (!this.authService.verifyEmailCode(email, code)) {
      throw new ForbiddenException("인증 코드가 올바르지 않습니다.");
    }
  }

  // 비밀번호 재설정
  async updatePassword(email: string, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundException("해당 이메일의 유저를 찾을 수 없습니다.");
    }

    if (!this.authService.checkEmailVerified(email)) {
      throw new ForbiddenException("이메일 인증이 완료되지 않았습니다.");
    }

    user.password = dto.newPassword;
    await this.userRepository.save(user);
  }
}

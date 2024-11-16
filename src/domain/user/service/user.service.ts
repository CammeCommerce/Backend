import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { AuthService } from "../../auth/auth.service";
import { UserLoginDto } from "../dto/request/user-login.dto";
import { UserLoginResultDto } from "../dto/response/user-login-result.dto";
import { plainToInstance } from "class-transformer";
import { UpdatePasswordDto } from "../dto/request/update-password.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService
  ) {}

  // 유저 로그인
  async loginUser(
    dto: UserLoginDto,
    session: Record<string, any>
  ): Promise<UserLoginResultDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email, password: dto.password },
    });

    if (!user) {
      throw new NotFoundException("유저를 찾을 수 없습니다.");
    }

    session.userId = user.id;
    session.email = user.email;

    return plainToInstance(UserLoginResultDto, {
      id: user.id,
      message: "로그인에 성공했습니다.",
    });
  }

  // 로그인 상태 확인
  async getLoginStatus(session: Record<string, any>): Promise<boolean> {
    if (!session.userId) {
      throw new ForbiddenException("로그인이 필요합니다.");
    }
    return true;
  }

  // 로그아웃
  async logoutUser(session: Record<string, any>): Promise<void> {
    session.destroy((err) => {
      if (err) {
        throw new Error("로그아웃에 실패했습니다.");
      }
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
      where: { email },
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

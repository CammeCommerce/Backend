import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";

// .env 파일 로드
dotenv.config();

@Injectable()
export class AuthService {
  private emailVerificationStatus: Map<
    string,
    { code: string; verified: boolean; expiration: number }
  > = new Map();

  // NodeMailer 트랜스포터 설정
  private transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 이메일 인증 요청
  async sendEmailVerification(email: string) {
    const code = Math.random().toString(36).substring(2, 8);
    const expiration = Date.now() + 300000;
    console.log(`Sending email verification to ${email}.`);

    // 이메일 전송
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "📧 이메일 인증 서비스 📧",
      text: `인증 코드: ${code}`,
    };

    await this.transporter.sendMail(mailOptions);

    // 인증 코드와 상태 저장
    this.emailVerificationStatus.set(email, {
      code,
      verified: false,
      expiration,
    });
  }

  // 이메일 인증 코드 검증
  verifyEmailCode(email: string, code: string): boolean {
    const verification = this.emailVerificationStatus.get(email);
    if (!verification || verification.code !== code) {
      return false;
    }
    this.emailVerificationStatus.set(email, {
      ...verification,
      verified: true,
    });
    return true;
  }

  // 이메일 인증 상태 확인
  checkEmailVerified(email: string): boolean {
    return this.emailVerificationStatus.get(email)?.verified ?? false;
  }
}

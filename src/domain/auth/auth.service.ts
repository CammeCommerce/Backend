import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  private isLoggedIn = false;

  loginSuccess() {
    this.isLoggedIn = true;
  }

  logout() {
    this.isLoggedIn = false;
  }

  checkLogin(): boolean {
    return this.isLoggedIn;
  }
}

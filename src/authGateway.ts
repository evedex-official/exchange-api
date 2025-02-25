import { HttpClient } from "./utils";

export interface JWT {
  accessToken: string;
}

export interface RefreshedJWT extends JWT {
  refreshToken: string;
}

export interface SignInSiweQuery {
  address: string;
  message: string;
  signature: string;
}

export enum Role {
  Admin = "admin",
  Manager = "manager",
  Partner = "partner",
  User = "user",
  AcademyCurator = "academy-curator",
  AcademyModerator = "academy-moderator",
}

export interface Me {
  id: string;
  role: Role;
}

export interface User extends Me {
  wallet: string;
  smartAccountAddress: string;
  smartAccountDeployed: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum Service {
  Exchange = "exchange",
  Affiliate = "affiliate",
  Academy = "academy",
}

export interface UserService {
  user: string;
  service: Service;
  createdAt: string;
}

export type UserServiceList = UserService[];

export interface Session {
  user: User;
  token: RefreshedJWT;
}

export interface AuthGatewayOptions {
  authURI: string;
  httpClient: HttpClient;
}

export class AuthGateway {
  constructor(public readonly options: AuthGatewayOptions) {}

  protected authGet<T>(path: string): Promise<T> {
    return this.options.httpClient
      .authRequest<T>({
        method: "GET",
        url: `${this.options.authURI}${path}`,
        headers: { Accept: "application/json" },
      })
      .then((res) => res.data);
  }

  protected post<T>(path: string, body: any): Promise<T> {
    return this.options.httpClient
      .request<T>({
        method: "POST",
        url: `${this.options.authURI}${path}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      .then((res) => res.data);
  }

  // Getters
  me() {
    return this.authGet<Me>("/auth/user/me");
  }

  myServices() {
    return this.authGet<UserServiceList>("/api/user/me/service");
  }

  // Actions
  signInSiwe(query: SignInSiweQuery) {
    return this.post<Session>("/auth/sign-in/siwe", query);
  }

  refresh({ refreshToken }: RefreshedJWT) {
    return this.options.httpClient
      .request<Session>({
        method: "POST",
        url: `${this.options.authURI}/auth/refresh`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      })
      .then((res) => res.data);
  }
}

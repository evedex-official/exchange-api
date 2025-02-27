import { ApiKey, HttpClient, JWT, RefreshedJWT } from "./utils";
import { URL } from "url";

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

export interface AuthRestGatewayOptions {
  authURI: string;
  httpClient: HttpClient;
}

export class AuthRestGateway {
  constructor(public readonly options: AuthRestGatewayOptions) {}

  protected url(path: string, search?: string) {
    const url = new URL(this.options.authURI);
    url.pathname = path;
    if (search) {
      url.search = search;
    }
    return url.toString();
  }

  protected authGet<T>(path: string, search?: string): Promise<T> {
    return this.options.httpClient
      .authRequest<T>({
        method: "GET",
        url: this.url(path, search),
        headers: { Accept: "application/json" },
      })
      .then((res) => res.data);
  }

  protected post<T>(path: string, body: any): Promise<T> {
    return this.options.httpClient
      .request<T>({
        method: "POST",
        url: this.url(path),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      .then((res) => res.data);
  }

  setSession(session: JWT | RefreshedJWT | ApiKey) {
    this.options.httpClient.setSession(session);
  }

  getSession() {
    return this.options.httpClient.getSession();
  }

  // Getters
  me() {
    return this.authGet<Me>("/auth/user/me");
  }

  myServices() {
    return this.authGet<UserServiceList>("/auth/user/me/service");
  }

  // Actions
  signInSiwe(query: SignInSiweQuery) {
    return this.post<Session>("/auth/sign-in/siwe", query);
  }

  refresh({ refreshToken }: RefreshedJWT) {
    return this.options.httpClient
      .request<Session>({
        method: "POST",
        url: this.url("/auth/refresh"),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      })
      .then((res) => res.data);
  }
}

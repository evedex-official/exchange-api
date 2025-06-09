import { ApiKey, HttpClient, JWT, RefreshedJWT } from "./utils";

export interface SignInSiweQuery {
  wallet: string;
  message: string;
  signature: string;
  nonce: string;
}

export interface Nonce {
  nonce: string;
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
  smartAccountAddress: string;
}

export interface User extends Me {
  wallet: string;
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

  protected get<T>(path: string, search?: string): Promise<T> {
    return this.options.httpClient
      .request<T>({
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
    return this.post<Session>("/auth/user/sign-up", query);
  }

  getNonce() {
    return this.get<Nonce>("/auth/nonce");
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

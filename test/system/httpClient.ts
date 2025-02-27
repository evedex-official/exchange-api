import * as evedexApi from "../../src";
import axios from "axios";

export class UnauthorizedRequest extends Error {}

export class RefreshTokenExpiredError extends evedexApi.utils.RequestError {
  constructor(response: evedexApi.utils.Response<any>) {
    super("Refresh token is expired", response);
  }
}

export interface RestClientOptions {
  session?: evedexApi.utils.JWT | evedexApi.utils.RefreshedJWT | evedexApi.utils.ApiKey;
  authGateway?: evedexApi.AuthRestGateway;
}

export class RestClient implements evedexApi.utils.HttpClient {
  private session?: evedexApi.utils.JWT | evedexApi.utils.RefreshedJWT | evedexApi.utils.ApiKey;

  constructor(private readonly options: RestClientOptions) {
    this.session = options.session;
  }

  setAuthGateway(authGateway: evedexApi.AuthRestGateway) {
    this.options.authGateway = authGateway;
  }

  setSession(session: evedexApi.utils.JWT | evedexApi.utils.RefreshedJWT | evedexApi.utils.ApiKey) {
    this.session = session;
  }

  getSession():
    | evedexApi.utils.JWT
    | evedexApi.utils.RefreshedJWT
    | evedexApi.utils.ApiKey
    | undefined {
    return this.session;
  }

  async request<Data>(request: evedexApi.utils.Request): Promise<evedexApi.utils.Response<Data>> {
    try {
      const res = await axios.request({
        url: request.url,
        method: request.method,
        headers: request.headers,
        data: request.body,
      });

      return {
        status: res.status,
        statusText: res.statusText,
        data: res.data,
      };
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        throw new evedexApi.utils.RequestError(e.response.statusText, {
          status: e.response.status,
          statusText: e.response.statusText,
          data: e.response.data,
        });
      }

      throw e;
    }
  }

  async authRequest<Data>(
    request: evedexApi.utils.Request,
  ): Promise<evedexApi.utils.Response<Data>> {
    if (!this.session) {
      throw new UnauthorizedRequest();
    }

    const headers = { ...request.headers };
    if ("accessToken" in this.session) {
      headers["Authorization"] = `Bearer ${this.session.accessToken}`;
    } else if ("apiKey" in this.session) {
      headers["x-api-key"] = this.session.apiKey;
    } else {
      throw new UnauthorizedRequest();
    }

    try {
      return await this.request({
        ...request,
        headers,
      });
    } catch (e) {
      if (
        e instanceof evedexApi.utils.RequestError &&
        e.response?.status === 401 &&
        this.options.authGateway
      ) {
        if (this.options.authGateway && "refreshToken" in this.session) {
          try {
            const { token } = await this.options.authGateway.refresh(this.session); // todo: use queue
            this.setSession(token);
            return await this.authRequest(request);
          } catch (e2) {
            if (e2 instanceof evedexApi.utils.RequestError && e2.response?.status === 401) {
              throw new RefreshTokenExpiredError(e2.response);
            }
            throw e2;
          }
        }
      }
      throw e;
    }
  }
}

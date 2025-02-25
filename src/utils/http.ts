import { JWT, RefreshedJWT } from "./types";

type Method =
  | "get"
  | "GET"
  | "delete"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH"
  | "purge"
  | "PURGE"
  | "link"
  | "LINK"
  | "unlink"
  | "UNLINK";

export interface Request {
  method: Method | string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface Response<Data> {
  status: number;
  statusText?: string;
  headers?: Record<string, string>;
  data: Data;
}

export class RequestError extends Error {
  response?: Response<any>;

  constructor(message: string, response?: Response<any>) {
    super(message);
    this.response = response;
  }
}

export interface HttpClient {
  setSession(jwt: JWT | RefreshedJWT);

  getSession(): JWT | RefreshedJWT | undefined;

  request<Data>(requestConfig: Request): Promise<Response<Data>>;

  authRequest<Data>(requestConfig: Request): Promise<Response<Data>>;
}

type QueryParamValue = string | number | boolean;

function queryParamValueToString(value: QueryParamValue) {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return String(value);
}

export function serializeQueryParams<P extends object>(params: P) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([f, v]) => {
      if (Array.isArray(v)) {
        return v.map((e) => `${f}=${queryParamValueToString(e)}`).join("&");
      }
      if (v) {
        return `${f}=${queryParamValueToString(v)}`;
      }
    })
    .join("&");
}

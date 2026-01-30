export type Callback<P> = (payload: P) => any;

export interface CentrifugeSubscription {
  onPublication(callback: Callback<any>): void;

  subscribe(): void;

  unsubscribe(): void;
}
export interface SubscriptionTokenContext {
  channel: string;
}
export interface SubscriptionDataContext {
  channel: string;
}

/** Stream postion describes position of publication inside a stream.  */
export interface StreamPosition {
  offset: number;
  epoch: string;
}

export interface SubscriptionOptions {
  /** allows setting initial subscription token (JWT) */
  token: string;
  /** allows setting function to get/refresh subscription token */
  getToken: null | ((ctx: SubscriptionTokenContext) => Promise<string>);
  /** data to send to a server with subscribe command */
  data: any | null;
  /** allows setting function to get/renew subscription data */
  getData: null | ((ctx: SubscriptionDataContext) => Promise<any>);
  /** force recovery on first subscribe from a provided StreamPosition. */
  since: StreamPosition | null;
  /** min delay between resubscribe attempts. */
  minResubscribeDelay: number;
  /** max delay between resubscribe attempts. */
  maxResubscribeDelay: number;
  /** ask server to make subscription positioned. */
  positioned: boolean;
  /** ask server to make subscription recoverable. */
  recoverable: boolean;
  /** ask server to send join/leave messages. */
  joinLeave: boolean;
  /** delta format to be used */
  delta: "fossil";
}

export interface CentrifugeClient {
  onConnected(callback: Callback<any>): void;

  onDisconnected(callback: Callback<any>): void;

  connect(): void;

  assignChannel(name: string, options?: Partial<SubscriptionOptions>): CentrifugeSubscription;
}

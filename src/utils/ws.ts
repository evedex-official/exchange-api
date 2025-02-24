export type Callback<P> = (payload: P) => any;

export interface CentrifugeSubscription {
  onPublication(callback: Callback<any>): void;

  subscribe(): void;

  unsubscribe(): void;
}

export interface AssignChannelOptions {
  recoverable: boolean;
}

export interface CentrifugeClient {
  onConnected(callback: Callback<any>): void;

  onDisconnected(callback: Callback<any>): void;

  assignChannel(name: string, options?: AssignChannelOptions): CentrifugeSubscription;
}

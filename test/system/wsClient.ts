import * as evedexApi from "../../src";
import { Centrifuge, PublicationContext, Subscription } from "centrifuge";

export class CentrifugeSubscription implements evedexApi.utils.CentrifugeSubscription {
  constructor(
    protected readonly channel: Subscription,
    protected readonly client: CentrifugeClient,
  ) {
    channel.on("subscribed", (ctx) => {
      if (ctx.wasRecovering && !ctx.recoverable) {
        this.onRecover(null);
        this.client.onRecover(this);
      }
    });
    channel.on("publication", (ctx) => this.onPublication(ctx));
  }

  onPublication = evedexApi.utils.signal<PublicationContext>();

  onRecover = evedexApi.utils.signal<null>();

  subscribe() {
    this.channel.subscribe();
  }

  unsubscribe() {
    this.channel.unsubscribe();
    this.onPublication(evedexApi.utils.SignalSkipAll);
  }
}

export class CentrifugeClient implements evedexApi.utils.CentrifugeClient {
  protected readonly channels = new Map<string, CentrifugeSubscription>();

  constructor(
    protected readonly centrifuge: Centrifuge,
    protected readonly prefix: string,
  ) {
    centrifuge.on("connected", () => this.onConnected(null));
    centrifuge.on("disconnected", () => this.onDisconnected(null));
  }

  onConnected = evedexApi.utils.signal<null>();

  onDisconnected = evedexApi.utils.signal<null>();

  onRecover = evedexApi.utils.signal<CentrifugeSubscription>();

  connect() {
    return this.centrifuge.connect();
  }

  assignChannel(name: string, options?: evedexApi.utils.AssignChannelOptions) {
    let channel = this.channels.get(name);
    if (channel) return channel;

    channel = new CentrifugeSubscription(
      this.centrifuge.newSubscription(`${this.prefix}:${name}`, options),
      this,
    );
    this.channels.set(name, channel);

    return channel;
  }
}

import Big from "big.js";
import { utils as cryptoUtils } from "@eventhorizon/exchange-crypto";
import {
  signal,
  Callback,
  CentrifugeClient,
  MarketDepth,
  MarketDepthLevel,
  MatcherState,
  Order,
  OrderFillFee,
  Position,
  TpSl,
  Trade,
  expandOrderBook,
} from "./utils";

export interface HeartbeatEvent {
  t: number;
}

export interface MatcherUpdateEvent {
  state: MatcherState;
  updatedAt: string;
}

export interface OrderBookLevelUpdate extends MarketDepthLevel {
  fillingPercent: number;
}

export interface OrderBookUpdateEvent {
  instrument: string;
  t: number;
  asks: OrderBookLevelUpdate[];
  bids: OrderBookLevelUpdate[];
  spread: number;
  asksVolumePercent: number;
  bidsVolumePercent: number;
}

export interface ListenOrderBookQuery {
  instrument: string;
}

export interface UnListenOrderBookQuery {
  instrument: string;
}

export interface OrderBookBestUpdateEvent extends MarketDepth {
  instrument: string;
}

export interface TradeEvent {
  instrument: string;
  side: cryptoUtils.Side;
  fillQuantity: number;
  fillPrice: number;
  createdAt: Date;
}

export interface ListenTradeQuery {
  instrument: string;
}

export interface UnListenTradeQuery {
  instrument: string;
}

export interface AccountEvent {
  user: string;
  marginCall: boolean;
  updatedAt: string;
}

export interface FundingEvent {
  user: string;
  coin: string;
  quantity: string;
  updatedAt: string;
}

export interface UserParam {
  userExchangeId: string | number;
}

export interface ListenAccountQuery extends UserParam {}

export interface UnListenAccountQuery extends UserParam {}

export interface ListenFundingQuery extends UserParam {}

export interface UnListenFundingQuery extends UserParam {}

export interface ListenPositionsQuery extends UserParam {}

export interface UnListenPositionsQuery extends UserParam {}

export interface ListenOrdersQuery extends UserParam {}

export interface UnListenOrdersQuery extends UserParam {}

export interface ListenOrdersFeesQuery extends UserParam {}

export interface UnListenOrdersFeesQuery extends UserParam {}

export interface ListenTpSlQuery extends UserParam {}

export interface UnListenTpSlQuery extends UserParam {}

export interface ExchangeWsGatewayOptions {
  wsClient: CentrifugeClient;
}

export class ExchangeWsGateway {
  private readonly listenedChannels = new Set<string>();

  constructor(public readonly options: ExchangeWsGatewayOptions) {}

  protected listenChannel<T>(name: string, recoverable: boolean, handler: Callback<{ data: T }>) {
    if (this.listenedChannels.has(name)) return;

    const channel = this.options.wsClient.assignChannel(name, { recoverable });
    channel.onPublication(handler);
    channel.subscribe();
    this.listenedChannels.add(name);
  }

  protected unListenChannel(name: string, recoverable: boolean) {
    if (!this.listenedChannels.has(name)) return;

    this.options.wsClient.assignChannel(name, { recoverable }).unsubscribe();
    this.listenedChannels.delete(name);
  }

  // Market
  onHeartbeat = signal<HeartbeatEvent>();

  listenHeartbeat() {
    this.listenChannel<HeartbeatEvent>("heartbeat", false, (ctx) => this.onHeartbeat(ctx.data));
  }

  unListenHeartbeat() {
    this.unListenChannel("heartbeat", false);
  }

  onMatcherUpdate = signal<MatcherUpdateEvent>();

  listenMatcher() {
    this.listenChannel<MatcherUpdateEvent>("info", false, (ctx) => this.onMatcherUpdate(ctx.data));
  }

  unListenMatcher() {
    this.unListenChannel("info", false);
  }

  onOrderBookUpdate = signal<OrderBookUpdateEvent>();

  listenOrderBook(query: ListenOrderBookQuery) {
    this.listenChannel<{ instrument: string; orderBook: MarketDepth }>(
      `orderBook-${query.instrument}`,
      false,
      ({ data }) => {
        const asksMetrics = data.orderBook.asks.reduce(
          ({ max, sum }, { quantity }) => ({
            max: Math.max(quantity, max),
            sum: Big(quantity).plus(sum).toString(),
          }),
          { max: 0, sum: "0" },
        );
        const bidsMetrics = data.orderBook.bids.reduce(
          ({ max, sum }, { quantity }) => ({
            max: Math.max(quantity, max),
            sum: Big(quantity).plus(sum).toString(),
          }),
          { max: 0, sum: "0" },
        );
        const asks = data.orderBook.asks.reverse().map((item) => ({
          ...item,
          fillingPercent: item.quantity / asksMetrics.max,
        }));
        const bids = data.orderBook.bids.reverse().map((item) => ({
          ...item,
          fillingPercent: item.quantity / bidsMetrics.max,
        }));
        const orderBookVolume = Big(asksMetrics.sum).plus(bidsMetrics.sum);
        const asksVolumePercent = !orderBookVolume.eq(0)
          ? Big(asksMetrics.sum).div(orderBookVolume).toNumber()
          : 0;
        const bidsVolumePercent = 1 - asksVolumePercent;
        const spread = bids.length && asks.length ? asks[0].price - bids[0].price : 0;

        this.onOrderBookUpdate({
          instrument: data.instrument,
          ...expandOrderBook(data.orderBook),
        });
      },
    );
  }

  unListenOrderBook(query: UnListenOrderBookQuery) {
    this.unListenChannel(`orderBook-${query.instrument}`, false);
  }

  onOrderBookBestUpdate = signal<OrderBookBestUpdateEvent>();

  listenOrderBookBest(query: ListenOrderBookQuery) {
    this.listenChannel<{ instrument: string; orderBook: MarketDepth }>(
      `orderBook-${query.instrument}-best`,
      false,
      ({ data: { instrument, orderBook } }) => {
        this.onOrderBookBestUpdate({
          instrument,
          t: orderBook.t,
          asks: orderBook.asks,
          bids: orderBook.bids,
        });
      },
    );
  }

  unListenOrderBookBest(query: UnListenOrderBookQuery) {
    this.unListenChannel(`orderBook-${query.instrument}-best`, false);
  }

  onTrade = signal<TradeEvent>();

  listenTrades(query: ListenTradeQuery) {
    this.listenChannel<Trade>(`trade-${query.instrument}`, false, ({ data }) =>
      this.onTrade({
        instrument: data.instrument,
        side: data.side,
        fillQuantity: data.fillQuantity,
        fillPrice: data.fillPrice,
        createdAt: data.createdAt,
      }),
    );
  }

  unListenTrades(query: UnListenTradeQuery) {
    this.unListenChannel(`trade-${query.instrument}`, false);
  }

  // User
  onAccountUpdate = signal<AccountEvent>();

  listenAccount(query: ListenAccountQuery) {
    this.listenChannel<AccountEvent>(`user-${query.userExchangeId}`, true, ({ data }) =>
      this.onAccountUpdate(data),
    );
  }

  unListenAccount(query: UnListenAccountQuery) {
    this.unListenChannel(`user-${query.userExchangeId}`, true);
  }

  onFundingUpdate = signal<FundingEvent>();

  listenFunding(query: ListenFundingQuery) {
    this.listenChannel<FundingEvent>(`funding-${query.userExchangeId}`, true, ({ data }) =>
      this.onFundingUpdate(data),
    );
  }

  unListenFunding(query: UnListenFundingQuery) {
    this.unListenChannel(`funding-${query.userExchangeId}`, true);
  }

  onPositionUpdate = signal<Position>();

  listenPositions(query: ListenPositionsQuery) {
    this.listenChannel<Position>(`position-${query.userExchangeId}`, true, ({ data }) =>
      this.onPositionUpdate(data),
    );
  }

  unListenPositions(query: UnListenPositionsQuery) {
    this.unListenChannel(`position-${query.userExchangeId}`, true);
  }

  onOrderUpdate = signal<Order>();

  listenOrders(query: ListenOrdersQuery) {
    this.listenChannel<Order>(`order-${query.userExchangeId}`, true, ({ data }) =>
      this.onOrderUpdate(data),
    );
  }

  unListenOrders(query: UnListenOrdersQuery) {
    this.unListenChannel(`order-${query.userExchangeId}`, true);
  }

  onOrderFeeUpdate = signal<OrderFillFee>();

  listenOrdersFees(query: ListenOrdersFeesQuery) {
    this.listenChannel<OrderFillFee>(`order-fee-${query.userExchangeId}`, true, ({ data }) =>
      this.onOrderFeeUpdate(data),
    );
  }

  unListenOrdersFees(query: UnListenOrdersFeesQuery) {
    this.unListenChannel(`order-fee-${query.userExchangeId}`, true);
  }

  onTpSlUpdate = signal<TpSl>();

  listenTpSl(query: ListenTpSlQuery) {
    this.listenChannel<TpSl>(`tpsl-${query.userExchangeId}`, true, ({ data }) =>
      this.onTpSlUpdate(data),
    );
  }

  unListenTpSl(query: UnListenTpSlQuery) {
    this.unListenChannel(`tpsl-${query.userExchangeId}`, true);
  }
}

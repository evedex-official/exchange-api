import crypto from "@eventhorizon/exchange-crypto";
import {
  AvailableBalance,
  CoinList,
  DxFeedAuthToken,
  FundingList,
  HttpClient,
  InstrumentList,
  InstrumentMetricsList,
  MarketDepth,
  MarketInfo,
  Order,
  OrderGroup,
  OrderList,
  OrderStatus,
  OrderType,
  PaginatedQuery,
  Position,
  PositionList,
  TpSl,
  TpSlList,
  TpSlStatus,
  Trade,
  Transfer,
  User,
  WalletBalanceList,
  serializeQueryParams,
} from "./utils";

export enum InstrumentListQueryField {
  Metrics = "metrics",
}

export enum OrderBookRoundPrices {
  OneTenth = "0.1",
  One = "1",
  Ten = "10",
  Fifty = "50",
  Hundred = "100",
}

export interface MarketDepthQuery {
  instrument: string;
  maxLevel: number;
  roundPrice: OrderBookRoundPrices;
}

export interface TradesQuery {
  instrument: string;
}

export interface OrderListQuery extends PaginatedQuery {
  instrument?: string;
  status?: OrderStatus[] | OrderStatus;
  group?: OrderGroup[] | OrderGroup;
  type?: OrderType[] | OrderType;
  side?: crypto.utils.Side;
  version?: string | number;
}

export interface TpSlListQuery extends PaginatedQuery {
  instrument?: string | string[];
  status?: TpSlStatus | TpSlStatus[];
  type?: crypto.utils.TpSlType;
}

export interface PositionUpdateQuery {
  instrument: string;
  leverage: number;
}

export interface OrderCancelQuery {
  orderId: string;
}

export interface OrderMassCancelQuery {
  instrument?: string;
}

export interface OrderMassCancelByIdQuery {
  orderIds: string[];
}

export interface TpSlUpdateQuery extends crypto.SignedTpSl {
  id: string;
}

export interface TpSlCancelQuery {
  instrument: string;
  id: string;
}

export interface RestGatewayOptions {
  exchangeURI: string;
  httpClient: HttpClient;
}

export class RestGateway {
  constructor(public readonly options: RestGatewayOptions) {}

  protected get<T>(path: string): Promise<T> {
    return this.options.httpClient
      .request<T>({
        method: "GET",
        url: `${this.options.exchangeURI}${path}`,
        headers: { Accept: "application/json" },
      })
      .then((res) => res.data);
  }

  protected authGet<T>(path: string): Promise<T> {
    return this.options.httpClient
      .authRequest<T>({
        method: "GET",
        url: `${this.options.exchangeURI}${path}`,
        headers: { Accept: "application/json" },
      })
      .then((res) => res.data);
  }

  protected authPost<T>(path: string, body: any): Promise<T> {
    return this.options.httpClient
      .authRequest<T>({
        method: "POST",
        url: `${this.options.exchangeURI}${path}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      .then((res) => res.data);
  }

  protected authPut<T>(path: string, body: any): Promise<T> {
    return this.options.httpClient
      .authRequest<T>({
        method: "PUT",
        url: `${this.options.exchangeURI}${path}`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      .then((res) => res.data);
  }

  protected authDelete<T>(path: string): Promise<T> {
    return this.options.httpClient
      .authRequest<T>({
        method: "DELETE",
        url: `${this.options.exchangeURI}${path}`,
        headers: { Accept: "application/json" },
      })
      .then((res) => res.data);
  }

  // Getters
  // Market
  getMarketInfo() {
    return this.get<MarketInfo>("/api/market");
  }

  getMarketDepth(init: MarketDepthQuery) {
    return this.get<MarketDepth>(
      `/api/market/${init.instrument}/deep?${serializeQueryParams({
        maxLevel: init.maxLevel,
        roundPrice: init.roundPrice,
      })}`,
    );
  }

  getTrades(init: TradesQuery) {
    return this.get<Trade[]>(`/api/market/${init.instrument}/trades`);
  }

  // User
  me() {
    return this.authGet<User>("/api/user/me");
  }

  getDxFeedAuthToken() {
    return this.authGet<DxFeedAuthToken>("/api/dx-feed/auth");
  }

  getWalletBalances() {
    return this.authGet<WalletBalanceList>("/api/user/balance");
  }

  getFunding() {
    return this.authGet<FundingList>("/api/user/funding");
  }

  getAvailableBalance() {
    return this.authGet<AvailableBalance>("/api/market/available-balance");
  }

  getPositions() {
    return this.authGet<PositionList>("/api/position");
  }

  getOrders(query: OrderListQuery) {
    return this.authGet<OrderList>(
      `/api/order?${serializeQueryParams({
        ...query,
        limit: query.limit ?? 20,
        offset: query.offset ?? 0,
      })}`,
    );
  }

  getTpSl(query: TpSlListQuery) {
    return this.authGet<TpSlList>(
      `/api/tpsl?${serializeQueryParams({
        ...query,
        limit: query.limit ?? 20,
        offset: query.offset ?? 0,
      })}`,
    );
  }

  // Instrument
  getCoins() {
    return this.get<CoinList>("/api/coin");
  }

  getInstruments() {
    return this.get<InstrumentList>("/api/market/instrument");
  }

  getInstrumentsMetrics() {
    return this.get<InstrumentMetricsList>(
      `/api/market/instrument?fields=${InstrumentListQueryField.Metrics}`,
    );
  }

  // Actions
  // Balance
  withdraw(query: crypto.SignedTradingBalanceWithdraw) {
    return this.authPost<Transfer>("/api/transfer/pf/withdraw", query);
  }

  // Position
  updatePosition(query: PositionUpdateQuery) {
    return this.authPut<Position>(`/api/position/${query.instrument}`, {
      leverage: query.leverage,
    });
  }

  closePosition(query: crypto.SignedPositionCloseOrder) {
    return this.authPost<Order>(`/api/position/${query.instrument}/close`, query);
  }

  // Order
  createLimitOrder(query: crypto.SignedLimitOrder) {
    return this.authPost<Order>("/api/order/limit", query);
  }

  replaceLimitOrder(query: crypto.SignedReplaceLimitOrder) {
    const { quantity, limitPrice, signature } = query;

    return this.authPut<{}>(`/api/order/${query.orderId}/limit`, {
      quantity,
      limitPrice,
      signature,
    });
  }

  createMarketOrder(query: crypto.SignedMarketOrder) {
    return this.authPost<Order>("/api/order/market", query);
  }

  createStopLimitOrder(query: crypto.SignedStopLimitOrder) {
    return this.authPost<Order>("/api/order/stop-limit", query);
  }

  replaceStopLimitOrder(init: crypto.SignedReplaceStopLimitOrder) {
    const { quantity, limitPrice, stopPrice, signature } = init;

    return this.authPut<{}>(`/api/order/${init.orderId}/stop-limit`, {
      quantity,
      limitPrice,
      stopPrice,
      signature,
    });
  }

  cancelOrder(query: OrderCancelQuery) {
    return this.authDelete<{}>(`/api/order/${query.orderId}`);
  }

  massCancelUserOrders(query: OrderMassCancelQuery) {
    return this.authPost<{}>("/api/order/mass-cancel", query);
  }

  massCancelUserOrdersById(query: OrderMassCancelByIdQuery) {
    return this.authPost<{}>("/api/order/mass-cancel-by-id", query);
  }

  // TpSl
  createTpSl(tpsl: crypto.SignedTpSl) {
    return this.authPost<TpSl>(`/api/tpsl/${tpsl.instrument}`, tpsl);
  }

  updateTpSl(query: TpSlUpdateQuery) {
    return this.authPut<TpSl>(`/api/tpsl/${query.instrument}/${query.id}`, {
      instrument: query.instrument,
      type: query.type,
      order: query.order,
      query: query.quantity,
      price: query.price,
      side: query.side,
      signature: query.signature,
    });
  }

  cancelTpSl(query: TpSlCancelQuery) {
    return this.authDelete<TpSl>(`/api/tpsl/${query.instrument}/${query.id}`);
  }
}

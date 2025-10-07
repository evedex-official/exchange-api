import * as crypto from "@evedex/exchange-crypto";
import { SignedTpSl } from "@evedex/exchange-crypto";
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
  OrderBookRoundPrices,
  OrderGroup,
  OrderList,
  OrderStatus,
  OrderType,
  PaginatedQuery,
  PositionList,
  TpSl,
  TpSlList,
  TpSlStatus,
  Trade,
  Transfer,
  User,
  WalletBalanceList,
  serializeQueryParams,
  type OpenedOrdersList,
  type Power,
  type RecentTrade,
  TransferType,
  TransferStatus,
  TransferList,
  type LimitOrderBatchCreateResult,
  type PositionUpdateResponse,
} from "./utils";

export enum InstrumentListQueryField {
  Metrics = "metrics",
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
  next?: string;
}

export interface TpSlListQuery extends PaginatedQuery {
  instrument?: string | string[];
  status?: TpSlStatus | TpSlStatus[];
  type?: crypto.utils.TpSlType;
}

export interface TransferListQuery extends PaginatedQuery {
  type?: TransferType[] | TransferType;
  status?: TransferStatus[] | TransferStatus;
  after?: Date;
  before?: Date;
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

export interface TpSlUpdateQuery extends SignedTpSl {
  id: string;
}

export interface TpSlCancelQuery {
  instrument: string;
  id: string;
}

export interface ExchangeRestGatewayOptions {
  exchangeURI: string;
  httpClient: HttpClient;
}

export interface PowerQuery {
  instrument: string;
}

export class ExchangeRestGateway {
  constructor(public readonly options: ExchangeRestGatewayOptions) {}

  protected url(path: string, search?: string) {
    const url = new URL(this.options.exchangeURI);
    url.pathname = path;
    if (search) {
      url.search = search;
    }
    return url.toString();
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

  protected authGet<T>(path: string, search?: string): Promise<T> {
    return this.options.httpClient
      .authRequest<T>({
        method: "GET",
        url: this.url(path, search),
        headers: { Accept: "application/json" },
      })
      .then((res) => res.data);
  }

  protected authPost<T>(path: string, body: any): Promise<T> {
    return this.options.httpClient
      .authRequest<T>({
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

  protected authPut<T>(path: string, body: any): Promise<T> {
    return this.options.httpClient
      .authRequest<T>({
        method: "PUT",
        url: this.url(path),
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
        url: this.url(path),
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
      `/api/market/${init.instrument}/deep`,
      serializeQueryParams({
        maxLevel: init.maxLevel,
        roundPrice: init.roundPrice,
      }),
    );
  }

  getTrades(init: TradesQuery) {
    return this.get<Trade[]>(`/api/market/${init.instrument}/trades`);
  }

  getRecentTrades(init: TradesQuery) {
    return this.get<RecentTrade[]>(`/api/market/${init.instrument}/recent-trades`);
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

  getPower(query: PowerQuery) {
    return this.authGet<Power>(`/api/market/power`, serializeQueryParams(query));
  }

  getTransfers(query: TransferListQuery) {
    return this.authGet<TransferList>(
      `/api/transfer`,
      serializeQueryParams({ ...query, limit: query.limit, offset: query.offset ?? 0 }),
    );
  }

  getPositions() {
    return this.authGet<PositionList>("/api/position");
  }

  getOrder(orderId: string) {
    return this.authGet<Order>(`/api/order/${orderId}`);
  }

  getOrders(query: OrderListQuery) {
    return this.authGet<OrderList>(
      `/api/order`,
      serializeQueryParams({
        ...query,
        limit: query.limit,
        offset: query.offset ?? 0,
      }),
    );
  }

  getOpenedOrders() {
    return this.authGet<OpenedOrdersList>(`/api/order/opened`);
  }

  getTpSl(query: TpSlListQuery) {
    return this.authGet<TpSlList>(
      `/api/tpsl`,
      serializeQueryParams({
        ...query,
        limit: query.limit,
        offset: query.offset ?? 0,
      }),
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
      `/api/market/instrument`,
      serializeQueryParams({
        fields: InstrumentListQueryField.Metrics,
      }),
    );
  }

  // Actions
  // Balance
  withdraw(query: crypto.SignedTradingBalanceWithdraw) {
    return this.authPost<Transfer>("/api/transfer/pf/withdraw", query);
  }

  // Position
  updatePosition(query: PositionUpdateQuery) {
    return this.authPut<PositionUpdateResponse>(`/api/position/${query.instrument}`, {
      leverage: query.leverage,
    });
  }

  closePosition(query: crypto.SignedPositionCloseOrder) {
    return this.authPost<Order>(`/api/position/${query.instrument}/close`, query);
  }

  closePositionV2(query: crypto.SignedPositionCloseOrder) {
    return this.authPost<Order>(`/api/v2/position/${query.instrument}/close`, query);
  }

  // Order
  createLimitOrder(query: crypto.SignedLimitOrder) {
    return this.authPost<Order>("/api/order/limit", query);
  }

  createLimitOrderV2(query: crypto.SignedLimitOrder) {
    return this.authPost<Order>("/api/v2/order/limit", query);
  }

  batchCreateLimitOrder(instrument: string, query: crypto.SignedLimitOrder[]) {
    return this.authPost<LimitOrderBatchCreateResult[]>(
      `/api/order/mass-limit/${instrument}`,
      query,
    );
  }

  batchCreateLimitOrderV2(instrument: string, query: crypto.SignedLimitOrder[]) {
    return this.authPost<LimitOrderBatchCreateResult[]>(
      `/api/v2/order/mass-limit/${instrument}`,
      query,
    );
  }

  replaceLimitOrder(query: crypto.SignedReplaceLimitOrder) {
    const { quantity, limitPrice, signature } = query;

    return this.authPut<{}>(`/api/order/${query.orderId}/limit`, {
      quantity,
      limitPrice,
      signature,
    });
  }

  // @deprecated
  batchReplaceLimitOrder(query: crypto.SignedReplaceLimitOrder[]) {
    return this.authPut<{}>("/api/order/limit", query);
  }

  batchReplaceInstrumentLimitOrder(instrument: string, query: crypto.SignedReplaceLimitOrder[]) {
    return this.authPut<{}>(`/api/order/limit/${instrument}`, query);
  }

  createMarketOrder(query: crypto.SignedMarketOrder) {
    return this.authPost<Order>("/api/order/market", query);
  }

  createMarketOrderV2(query: crypto.SignedMarketOrder) {
    return this.authPost<Order>("/api/v2/order/market", query);
  }

  createStopLimitOrder(query: crypto.SignedStopLimitOrder) {
    return this.authPost<Order>("/api/order/stop-limit", query);
  }

  createStopLimitOrderV2(query: crypto.SignedStopLimitOrder) {
    return this.authPost<Order>("/api/v2/order/stop-limit", query);
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

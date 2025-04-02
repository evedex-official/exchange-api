import { utils as cryptoUtils } from "@eventhorizon/exchange-crypto";
import { MatcherState, OrderGroup, OrderStatus, OrderType, TpSlStatus } from "./exchange";

export interface PaginatedQuery {
  limit?: number;
  offset?: number;
}

export type ListOf<T> = {
  list: T[];
  count: number;
};

// User
export interface JWT {
  accessToken: string;
}

export interface RefreshedJWT extends JWT {
  refreshToken: string;
}

export interface ApiKey {
  apiKey: string;
}

export interface User {
  id: string;
  authId: string;
  exchangeId: number;
  name: string;
  email: string;
  wallet: string;
  social: Array<{
    type: string;
    value: string;
  }>;
  avatar: string;
  level: number;
  locale: string;
  dateTimeFormat: string;
  favoriteInstruments: string[];
  marginCall: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DxFeedAuthToken {
  token: string;
  expireAt: number;
}

export interface WalletBalance {
  currency: string;
  balance: number;
  balanceUSD: number;
}

export type WalletBalanceList = WalletBalance[];

export interface Funding {
  coin: string;
  quantity: number;
  updatedAt: string;
}

export type FundingList = Funding[];

export interface FundingBalance {
  currency: string;
  balance: number;
}

export interface AvailableBalancePosition {
  instrument: string;
  side: cryptoUtils.Side;
  volume: string;
  initialMargin: string;
}

export interface AvailableBalanceOpenOrder {
  instrument: string;
  side: cryptoUtils.Side;
  unFilledVolume: string;
  unFilledInitialMargin: string;
}

export type UnfilledOrdersVolume = Record<string, number>;

export interface AvailableBalance {
  currency: string;
  funding: FundingBalance;
  position: AvailableBalancePosition[];
  openOrder: AvailableBalanceOpenOrder[];
  availableBalance: number;
  updatedAt: string;
  // @deprecated
  openOrders: UnfilledOrdersVolume;
  // @deprecated
  positions: Record<string, number>;
}

export interface Position {
  id: string;
  user: string;
  instrument: string;
  side: cryptoUtils.Side;
  quantity: number;
  avgPrice: number;
  fundingRate: number;
  leverage: number;
  maintenanceMargin: number;
  createdAt: string;
  updatedAt: string;
}

export interface PositionMetrics extends Position {
  unRealizedPnL: number;
  adlLevel: number;
}

export type PositionList = {
  list: PositionMetrics[];
};

export interface OrderFee {
  coin: string;
  quantity: number;
}

export interface Order {
  id: string;
  user: string;
  instrument: string;
  side: cryptoUtils.Side;
  type: OrderType;
  quantity: number;
  limitPrice: number;
  stopPrice: number | null;
  status: OrderStatus;
  rejectedReason?: string;
  unFilledQuantity: number;
  filledAvgPrice: number;
  realizedPnL: number;
  fee: OrderFee[];
  createdAt: string;
  updatedAt: string;
  triggeredAt: string | null;
  group: OrderGroup;
}

export type OrderList = ListOf<Order>;

export enum OrderFillFeeType {
  Liquidation = "liquidation",
  Adl = "adl",
  Order = "order",
}

export interface OrderFillFee {
  id: string;
  user: string;
  order: string;
  fill: string;
  coin: string;
  quantity: string;
  createdAt: Date;
  type: OrderFillFeeType;
}

export interface TpSl {
  id: string;
  instrument: string;
  type: cryptoUtils.TpSlType;
  side: cryptoUtils.Side;
  quantity: string; // Zero for full position
  price: string;
  status: TpSlStatus;
  triggerOrder: string | null;
  triggeredQuantity: string;
  cancelledReason: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TpSlList = ListOf<TpSl>;

export enum TransferType {
  Deposit = "deposit",
  Withdraw = "withdraw",
  TransferPFuturesToBalance = "transfer-pfutures-balance",
  TransferBalanceToPFutures = "transfer-balance-pfutures",
  PaymasterFee = "paymaster-fee",
  PaymasterRefund = "paymaster-refund",
}

export enum TransferStatus {
  Pending = "pending",
  Done = "done",
  Error = "error",
}

export interface Transfer {
  id: string;
  user: string;
  type: TransferType;
  coin: string;
  amount: number;
  fee: number;
  status: TransferStatus;
  createdAt: string;
  updatedAt: string;
}

// Instrument
export interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  precision: number;
  showPrecision: number;
  price: number;
}

export type CoinList = {
  list: Coin[];
};

export interface LeverageLimit {
  [maxLeverage: number]: number;
}

export interface MaintenanceMarginParam {
  percent: number;
  deviance: number;
}

export interface MaintenanceMarginMap {
  [rate: string]: MaintenanceMarginParam;
}

export enum InstrumentVisibility {
  All = "all",
  Restricted = "restricted",
  None = "none",
}

export interface Instrument {
  id: string;
  name: string;
  from: Omit<Coin, "price">;
  to: Omit<Coin, "price">;
  maxLeverage: number;
  leverageLimit: LeverageLimit;
  maintenanceMargin: MaintenanceMarginMap;
  lotSize: number;
  quantityIncrement: number;
  multiplier: number;
  visibility: InstrumentVisibility;
}

export type InstrumentList = Instrument[];

export interface InstrumentMetrics extends Instrument {
  isPopular: boolean;
  minPrice: number;
  maxPrice: number;
  minQuantity: number;
  maxQuantity: number;
  maxSlippage: number;
  fundingRate: number;
  fundingRateCreatedAt: Date;
  slippageLimit: number;
  fatFingerPriceProtection: number;
  lastPrice: number;
  markPrice: number;
  openInterest: number;
  low: number;
  high: number;
  closePrice: number;
  volume: number;
  volumeBase: number;
}

export type InstrumentMetricsList = InstrumentMetrics[];

// Market
export interface MarketInfo {
  state: MatcherState;
  fees: {
    maker: number;
    taker: number;
  };
  updatedAt: string;
}

export interface MarketDepthLevel {
  price: number;
  quantity: number;
}

export interface MarketDepth {
  t: number;
  asks: MarketDepthLevel[];
  bids: MarketDepthLevel[];
}

export interface Trade {
  orderId: string;
  user: string;
  instrument: string;
  side: cryptoUtils.Side;
  fillQuantity: number;
  fillPrice: number;
  status: OrderStatus.PartiallyFilled | OrderStatus.Filled;
  createdAt: string;
}

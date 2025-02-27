import Big from "big.js";
import { MarketDepth } from "./types";

export enum MatcherState {
  Active = "active",
  RequestStatusFail = "request-status-fail",
  MeDead = "me-dead",
  DbAdminDead = "db-admin-dead",
}

export enum OrderStatus {
  New = "NEW",
  PartiallyFilled = "PARTIALLY_FILLED",
  Filled = "FILLED",
  Cancelled = "CANCELLED",
  Rejected = "REJECTED",
  Expired = "EXPIRED",
  Replaced = "REPLACED",
}

export enum OrderGroup {
  Manually = "manually",
  TpSl = "tpsl",
  Liquidation = "liquidation",
  Adl = "adl",
}

export enum OrderType {
  Limit = "LIMIT",
  Market = "MARKET",
  Stop = "STOP",
  StopLimit = "STOP_LIMIT",
}

export enum TpSlStatus {
  WaitOrder = "waitOrder",
  Active = "active",
  Process = "process",
  Triggered = "triggered",
  Done = "done",
  Cancelled = "cancelled",
}

export function expandOrderBook(orderBook: MarketDepth) {
  const asksMetrics = orderBook.asks.reduce(
    ({ max, sum }, { quantity }) => ({
      max: Math.max(quantity, max),
      sum: Big(quantity).plus(sum).toString(),
    }),
    { max: 0, sum: "0" },
  );
  const bidsMetrics = orderBook.bids.reduce(
    ({ max, sum }, { quantity }) => ({
      max: Math.max(quantity, max),
      sum: Big(quantity).plus(sum).toString(),
    }),
    { max: 0, sum: "0" },
  );
  const asks = orderBook.asks.reverse().map((item) => ({
    ...item,
    fillingPercent: item.quantity / asksMetrics.max,
  }));
  const bids = orderBook.bids.reverse().map((item) => ({
    ...item,
    fillingPercent: item.quantity / bidsMetrics.max,
  }));
  const orderBookVolume = Big(asksMetrics.sum).plus(bidsMetrics.sum);
  const asksVolumePercent = !orderBookVolume.eq(0)
    ? Big(asksMetrics.sum).div(orderBookVolume).toNumber()
    : 0;
  const bidsVolumePercent = 1 - asksVolumePercent;
  const spread = bids.length && asks.length ? asks[0].price - bids[0].price : 0;

  return {
    t: orderBook.t,
    asks,
    bids,
    asksVolumePercent,
    bidsVolumePercent,
    spread,
  };
}

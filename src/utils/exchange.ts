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

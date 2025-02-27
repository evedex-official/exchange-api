import { config, src, waitSignal } from "../common";
import assert from "assert";
import { CentrifugeClient } from "./wsClient";
import { Centrifuge } from "centrifuge";
import WebSocket from "ws";

describe("ExchangeWsGateway", () => {
  const gateway = new src.ExchangeWsGateway({
    wsClient: new CentrifugeClient(
      new Centrifuge(config.centrifugoURI, { websocket: WebSocket }),
      config.centrifugoPrefix,
    ),
  });
  gateway.options.wsClient.connect();

  it("should subscribe to centrifugo channel", async () => {
    const signalWaiter = waitSignal(gateway.onHeartbeat);
    gateway.listenHeartbeat();
    const heartbeat = await signalWaiter;
    assert.equal("t" in heartbeat && typeof heartbeat.t === "number", true);
    gateway.unListenHeartbeat();
  });
});

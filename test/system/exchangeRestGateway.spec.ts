import { config, src } from "../common";
import assert from "assert";
import { RestClient } from "./httpClient";
import { userId, userApiKey } from "./utils";

describe("ExchangeRestGateway", () => {
  const gateway = new src.ExchangeRestGateway({
    exchangeURI: config.exchangeURI,
    httpClient: new RestClient({
      session: { apiKey: userApiKey },
    }),
  });

  it("should return my account info", async () => {
    const account = await gateway.me();

    assert.equal(account.authId === userId, true);
  });

  it("should return instruments list", async () => {
    const instruments = await gateway.getInstruments();

    assert.equal(Array.isArray(instruments), true);
    assert.equal(
      instruments.some(({ name }) => name === "DBTCUSDT"),
      true,
    );
  });
});

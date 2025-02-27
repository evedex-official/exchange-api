import { config, src } from "../common";
import assert from "assert";
import { RestClient } from "./httpClient";
import { siwe, userId } from "./utils";

describe("AuthRestGateway", () => {
  const userGateway = new src.AuthRestGateway({
    authURI: config.authURI,
    httpClient: new RestClient({}),
  });

  before(async () => {
    await userGateway.signInSiwe(siwe).then(({ token }) => userGateway.setSession(token));
  });

  it("should sign in", async () => {
    const authGateway = new src.AuthRestGateway({
      authURI: config.authURI,
      httpClient: new RestClient({}),
    });
    const result = await authGateway.signInSiwe(siwe);

    assert.equal("user" in result, true);
    assert.equal("token" in result, true);
  });

  it("should refresh my jwt", async () => {
    const authGateway = new src.AuthRestGateway({
      authURI: config.authURI,
      httpClient: new RestClient({}),
    });
    const { token: firstJWT } = await authGateway.signInSiwe(siwe);
    const { token: secondJWT } = await authGateway.refresh(firstJWT);

    assert.equal(firstJWT.accessToken !== secondJWT.accessToken, true);
    assert.equal(firstJWT.refreshToken !== secondJWT.refreshToken, true);

    authGateway.setSession(secondJWT);
    await authGateway.me();
  });

  it("should return my account info", async () => {
    const me = await userGateway.me();
    assert.equal(me.id, userId);
  });

  it("should return my services", async () => {
    const services = await userGateway.myServices();

    assert.equal(Array.isArray(services), true);
    assert.equal(
      services.some(({ service }) => service === "exchange"),
      true,
    );
  });
});

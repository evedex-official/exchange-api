import dotenv from "dotenv";
dotenv.config({ path: "test/system/.env" });
import { get as envGet } from "env-var";

export default {
  authURI: envGet("AUTH_URI").required().asUrlString(),
  exchangeURI: envGet("EXCHANGE_URI").required().asUrlString(),
  centrifugoURI: envGet("CENTRIFUGO_URI").required().asUrlString(),
  centrifugoPrefix: envGet("CENTRIFUGO_PREFIX").required().asString(),
};

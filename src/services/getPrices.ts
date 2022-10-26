import { networkTokens } from "../constants";
import { HTTP_STATUS_CODE } from "../constants/requests";
import { priceStore } from './swapsSocket';

type GetPriceArgs = {
  network?: any
}

const cachedPrices = {};

// 2 second cache
const EXPIRY_TIME = 2 * 1000;

export const getPrices = async ({ network }: GetPriceArgs) => {
  const now = Date.now()

  if (typeof network !== 'string' || !networkTokens[network]) {
    return ({
      status: HTTP_STATUS_CODE.BAD_REQUEST,
      body: { message: "UNSUPPORTED_NETWORK" }
    })
  }

  const cache = cachedPrices[network];

  if (cache && cache.expiry < now) {
    return cache.prices
  }

  const knownTokens = networkTokens[network];

  const tokens = {};

  knownTokens.forEach((token) => {
    const medianPrice = priceStore.medianPrices[token.knownToken];
    if (priceStore.medianPrices[token.knownToken]) {
      tokens[token.address] = medianPrice.toString();
    }
  })

  cachedPrices[network] = {
    expiry: now + EXPIRY_TIME,
    tokens
  }

  return ({
    status: HTTP_STATUS_CODE.OK,
    body: tokens
  })
}

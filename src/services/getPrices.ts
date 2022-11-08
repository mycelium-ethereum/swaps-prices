import {ethers} from "ethers";
import { networkTokens } from "../constants";
import { HTTP_STATUS_CODE } from "../constants/requests";
import { priceStore } from './swapsSocket';

type GetPriceArgs = {
  network?: any
}

const cachedPrices: Record<string, { expiry: number, tokens: Record<string, string> }> = {};

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
    return ({
      status: HTTP_STATUS_CODE.OK,
      body: cache.tokens
    })
  }

  const knownTokens = networkTokens[network];

  const tokens = {};

  knownTokens.forEach((token) => {
    const medianPrice = priceStore.medianPrices[token.knownToken];
    if (priceStore.medianPrices[token.knownToken]) {
      // we want to be in 10^30 units but prices are stored at 10^18
      tokens[token.address] = ethers.utils.parseUnits(medianPrice.toString(), 12 /* 30 - 18 */).toString();
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

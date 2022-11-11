import { KnownToken, ParsedTokenPrice } from "@mycelium-ethereum/swaps-keepers";
import { ethers } from "ethers";
import { ethersCalcMedian as calcMedian } from '@mycelium-ethereum/swaps-keepers/dist/src/utils/helpers';
import { broadcast } from "./swapsSocket";


class PriceStore {
  prices: Partial<Record<KnownToken, any>> = {};
  medianPrices: Partial<Record<KnownToken, ethers.BigNumber>> = {};

  public storePrice (key: string, tokenPrice: ParsedTokenPrice) {
    const { knownToken, price } = tokenPrice;
    // dont store false price
    if (!price) {
      console.error(`Price not found for token: ${knownToken}`)
      return
    }
    if (!this.prices[knownToken]) {
      this.prices[knownToken] = {};
    }
    // set above
    (this.prices[knownToken] as any)[key] = price;

    this.updateMedianPrice(knownToken);
  }
  public updateMedianPrice (token: KnownToken) {
    const cexPrices: Record<string, ethers.BigNumber> = this.prices[token as KnownToken];
    if (!cexPrices) {
      console.error("Cex prices undefined")
      return
    }
    const prices: ethers.BigNumber[] = Object.values(cexPrices);
    const medianPrice = calcMedian(prices);

    const previousMedianPrice = this.medianPrices[token as KnownToken]

    const medianPriceChanged = previousMedianPrice && !previousMedianPrice.eq(medianPrice);
    if (medianPriceChanged || !previousMedianPrice) {
      broadcast({
        t: "update",
        s: token,
        p: medianPrice.toString(),
        l: previousMedianPrice?.toString()
      })
    } 
    this.medianPrices[token as KnownToken] = medianPrice;
  }

  public clear () {
    this.prices = {};
    this.medianPrices = {};
  }
}

const priceStore = new PriceStore();
export default priceStore;



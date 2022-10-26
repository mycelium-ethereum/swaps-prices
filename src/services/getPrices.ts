type GetPriceArgs = {
  network?: any
}

const cachedPrices = {};

// 2 second cache
const expiry = 2 * 1000;

export const getPrices = async (priceArgs: GetPriceArgs) => {
  return ({
    status: 400,
    body: 'hello world'
  })
}

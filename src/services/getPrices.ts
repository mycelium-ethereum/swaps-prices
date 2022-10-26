type GetPriceArgs = {
  network?: any
}

export const getPrices = async (priceArgs: GetPriceArgs) => {
  return ({
    status: 400,
    body: 'hello world'
  })
}

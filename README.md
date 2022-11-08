# Swaps Prices
Pricing reposititory for Mycelium Perpetual Swaps.
Exposes a websocket which streams price aggregations from each of the CEX's as well as a REST endpoint to access these prices.


### Websocket Events
An example client is written in `./test/client.ts` and can be started by running `yarn && yarn client`.

Messages are emitted when the median price changes.
Example event
```
{
    s: // token symbol
    p: // median price
    l: // last median price
}
```
To determine if this update will trigger a price update, the keepers check if the delta between `p` and `l` is above some threshold.


### REST Endpoint
This services exposes a `/prices` route which emits the current median prices for each of the networks tokens. These prices are formatted in 10^30 decimals.

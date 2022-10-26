/* eslint-disable */ // allow dotenv to be used ASAP
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
dotenv.config({ path: './.secrets' });

import express, { ErrorRequestHandler } from 'express';
import { json as jsonBodyParser } from 'body-parser';
import cors from 'cors';
// import BigNumber from 'bignumber.js';
// import swaggerUi from 'swagger-ui-express';
// import db from './db';
import { priceRouter } from './src/routes';
import {subscribeWsFeeds, swapsWsServer} from './src/services';
// import { startSyncingKnownBalancerPoolSwaps } from './services/pools/balancer'
// import { startSyncingValueTransfersForKnownPools } from './services/pools/valueTransfers'
// import {
  // startSyncingTestnetCommits,
  // startSyncingTradeHistoryForKnownPools,
  // startSyncingTradeHistoryForKnownPoolsV2,
  // startSyncingUpkeeps,
  // startSyncingUpkeepsV2,
  // startPPV2AlertingService,
  // startWatchingPendingCommitsForKnownPoolsV2,
// } from './services/pools';
// import {
  // startSyncingSwapsTradingRewards,
  // startSyncingSwapsReferralRewards,
  // startSyncingPriceCandles,
  // startSyncingPriceUpdates,
  // startSyncingTokenStats,
  // startSyncingSwapsMlpStats,
  // startSyncingSwapsFeeStats,
  // startSyncingSwapsSpreadCapture,
  // startSyncingSwapV1Actions,
  // startSyncingSwapsVolumes,
  // subscribeWsFeeds
// } from './services/trs';
// import { apiDocumentation } from './docs/apidoc'
// import { isProd } from './utils'
// import swapsWsServer from './routes/swapsWebsocket';

// import { TIME } from './constants';
/* eslint-enable */

const app = express();
const port = process.env.PORT || 3030;

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Tracer API Documentation'
};

app.use(jsonBodyParser());
app.use(cors());

app.use('/', priceRouter);

// app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDocumentation, swaggerUiOptions));
// app.get('/spec', function (req, res) {
  // res.status(200).send(apiDocumentation);
// });

app.get('/', (req, res) => {
  res.status(200).send({ message: 'healthy' });
});

/* eslint-disable  @typescript-eslint/no-unused-vars */
// the unused vars in the function signature are required
// to make express use this as error handling middleware
const fallbackErrorHandler: ErrorRequestHandler = function (error, req, res, next) {
  /* eslint-enable  @typescript-eslint/no-unused-vars */
  console.error('Caught Unhandled Error:', error.stack);
  console.error('Request:', JSON.stringify({
    headers: req.headers,
    protocol: req.protocol,
    url: req.url,
    method: req.method,
    body: req.body,
    cookies: req.cookies,
    ip: req.ip
  }, null, 2));
  // if (isProd()) {
  if (false) {
    res.status(500).send({ message: 'Unhandled Error' });
  } else {
    res.status(500).send({ message: 'Unhandled Error', data: error.stack });
  }
};

app.use(fallbackErrorHandler);

// The 404 Route (ALWAYS Keep this as the last route)
app.use(function (req, res) {
  res.status(404).send('Not Found');
});

const main = async () => {
  const server = app.listen(port, () => {
    console.log(`Tracer API listening on port ${port}`);
  });

  subscribeWsFeeds();
  // handle server upgrade on ws
  server.on('upgrade', (request, socket, head) => {
    swapsWsServer.handleUpgrade(request, socket, head, socket => {
      swapsWsServer.emit('connection', socket, request);
    });
  });
}

main()
  .catch(error => {
    console.error('Failed to initialise app', error);
    process.exit(1);
  });

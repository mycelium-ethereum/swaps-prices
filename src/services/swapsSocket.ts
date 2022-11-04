import { createBinanceWsFeeds, createBitfinexWsFeeds, createFtxWsFeeds, KnownToken } from '@mycelium-ethereum/swaps-keepers';
import { WebsocketClient } from '@mycelium-ethereum/swaps-keepers/dist/src/entities/SocketClient';
import { NETWORKS, networkTokens } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import ws from 'ws';
import priceStore from './priceStore';

const connectedClients = new Map();
const swapsWsServer = new ws.Server({
  noServer: true,
});

swapsWsServer.on('connection', (socket: ws & { isAlive: boolean }) => {
  const socketId = uuidv4();
  console.log(`Connecting client: ${socketId}`);

  // Keep track of the stream, so that we can send all of them messages.
  connectedClients.set(socketId, socket);

  // Attach event handler to mark this client as alive when pinged.
  socket.isAlive = true;
  socket.on('pong', () => { 
    console.log(`Received pong. Keeping ${socketId} alive`);
    socket.isAlive = true;
  });

  // When the stream is closed, clean up the stream reference.
  socket.on('close', function() {
    console.log(`Closing client: ${socketId}`);
    connectedClients.delete(socketId);
  });
});

// Broadcast to all.
const broadcast = (data: any) => {
  swapsWsServer.clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(data), { binary: false });
    }
  });
}

const pingConnectedClients = setInterval(() => {
  Array.from(connectedClients.values()).forEach((client) => {
    if (!client.isAlive) { client.terminate(); return; }
    client.isAlive = false;
    client.ping();
  });
}, 10000);


// const wsConfig = {
  // Subaccount nickname
  // subAccountName: 'sub1',

  // how long to wait (in ms) before deciding the connection should be terminated & reconnected
  // pongTimeout: 1000,

  // how often to check (in ms) that WS connection is still alive
  // pingInterval: 10000,

  // how long to wait before attempting to reconnect (in ms) after connection is closed
  // reconnectTimeout: 500,

  // override which URL to use for websocket connections
  // wsUrl: 'wss://example.ftx.com/ws'
// };

const onError = (info: any) => {
  console.error(info);
}

// binance client setup
const binanceClient = new WebsocketClient('binance', {
  wsUrl: `wss://stream.binance.com/stream`,
});
binanceClient.on('update', (data) => priceStore.storePrice('binance', data))
binanceClient.on('error', onError)

// ftx client setup
const ftxClient = new WebsocketClient('ftx', {
  wsUrl: 'wss://ftx.com/ws/'
})
ftxClient.on('update', data => priceStore.storePrice('ftx', data));
ftxClient.on('error', onError)

// bitfinexClient client setup
const bitfinexClient = new WebsocketClient('bitfinex', {
  wsUrl: 'wss://api-pub.bitfinex.com/ws/2'
})
bitfinexClient.on('update', data => priceStore.storePrice('bitfinex', data));
bitfinexClient.on('error', onError)

/**
 * Subscribes each feed to a list of known tokens
 */
const subscribeWsFeeds = () => {
  const tokens: KnownToken[] = networkTokens[NETWORKS.ARBITRUM_MAINNET].map((token) => token.knownToken);
  bitfinexClient.subscribe(createBitfinexWsFeeds(tokens))
  ftxClient.subscribe(createFtxWsFeeds(tokens))
  binanceClient.subscribe(createBinanceWsFeeds(tokens))
}

export {
  subscribeWsFeeds,
  swapsWsServer,
  broadcast,
  pingConnectedClients,
  binanceClient,
  bitfinexClient,
  ftxClient
}

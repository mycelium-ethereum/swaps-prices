import {ethers} from 'ethers';
import ws from 'ws';
// const client = new ws('ws://localhost:3030');
const client = new ws('wss://pricing.mycelium.xyz');

client.on('open', () => {
  console.log("Connectioned opened")
});

client.on('close', () => {
  console.log("Connection closed")
});

client.onmessage = (message) => {
  const msg = parseRawWsMessage(message);
  const lastPrice = ethers.BigNumber.from(msg.l);
  const newPrice = ethers.BigNumber.from(msg.p);
  const delta = lastPrice.sub(newPrice).abs();
  const diff = (delta.mul(ethers.utils.parseEther('1'))).div(lastPrice).mul(100)

  console.log(`Received update`, { ...msg, difference: `${ethers.utils.formatEther(diff)}%`});
}

client.on('ping', () => {
  console.log("Received ping")
  client.pong()
})

export function parseRawWsMessage(event: any): any {
  if (typeof event === 'string') {
    const parsedEvent = JSON.parse(event);

    if (parsedEvent.data) {
      if (typeof parsedEvent.data === 'string') {
        return parseRawWsMessage(parsedEvent.data);
      }
      return parsedEvent.data;
    }
  }
  if (event?.data) {
    return JSON.parse(event.data);
  }
  return event;
}

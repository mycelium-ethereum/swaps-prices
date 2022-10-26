import ws from 'ws';
const client = new ws('ws://localhost:3030');

client.on('open', () => {
  console.log("Connectioned opened")
});

client.on('close', () => {
  console.log("Connection closed")
});

client.onmessage = (message) => {
  console.log("Received update", parseRawWsMessage(message));
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

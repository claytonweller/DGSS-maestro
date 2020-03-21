import * as WebSocket from 'ws'
const wss = new WebSocket.Server({ port: 8080 })
console.warn(`Websockets listening on wss://localhost:${wss.options.port}`)
wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
    const payload = JSON.parse(message)

    if (payload.count > 4) {
      ws.send(JSON.stringify('YOU DID IT!'))
    }

    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  })
})


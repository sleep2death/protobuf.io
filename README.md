# protocol.io

[![npm](https://img.shields.io/npm/v/protobuf.io.svg)](https://github.com/sleep2death/protobuf.io)
[![Build Status](https://travis-ci.com/sleep2death/protobuf.io.svg?branch=master)](https://travis-ci.org/sleep2death/protobuf.io)

**protocol.io** is a simple socket server which sending and recieving data with [protocol buffers](https://developers.google.com/protocol-buffers/).The project is inspired by [socket.io](https://github.com/socketio/socket.io/)
### Installation
`npm install protobuf.io --save` or `yarn add protobuf.io`
### How to use
```
var server = require('protobuf.io')({port: 3000, protocolPath: 'main.proto'})

server.on('error', error => {
  console.error(error)
})

server.on('listening', () => {
  console.log('Listening port:', server.port)
})
server.start()
```

UNDER CONSTRUCTION

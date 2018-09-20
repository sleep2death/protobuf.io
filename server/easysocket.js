var easysocket = {
  _prepareSocket: function (socket) {
    socket.chunck = {
      messageSize: 0,
      messageIndex: 0,
      buffer: Buffer.alloc(0),
      bufferStack: Buffer.alloc(0)
    }
  },
  send: function (socket, index, pb, callback) {
    if (!socket.chunk) easysocket._prepareSocket(socket)

    var buffer = Buffer.from(pb)
    var consolidatedBuffer = Buffer.alloc(8 + buffer.length)

    consolidatedBuffer.writeInt32LE(buffer.length, 0)
    consolidatedBuffer.writeInt32LE(index, 4)
    buffer.copy(consolidatedBuffer, 8)

    socket.write(consolidatedBuffer, function (err) {
      if (err) throw err

      if (callback) {
        callback(socket)
      }
    })
  },
  recieve: function (socket, pb, callback) {
    if (!socket.chunk) easysocket._prepareSocket(socket)

    socket.chunck.bufferStack = Buffer.concat([socket.chunck.bufferStack, pb])

    var reCheck = false
    do {
      reCheck = false
      if (socket.chunck.messageSize === 0 && socket.chunck.bufferStack.length >= 8) {
        socket.chunck.messageSize = socket.chunck.bufferStack.readInt32LE(0)
        socket.chunck.messageIndex = socket.chunck.bufferStack.readInt32LE(4)
      }

      if (socket.chunck.messageSize !== 0 && socket.chunck.bufferStack.length >= socket.chunck.messageSize + 8) {
        var buffer = socket.chunck.bufferStack.slice(8, socket.chunck.messageSize + 8)
        socket.chunck.messageSize = 0
        socket.chunck.bufferStack = socket.chunck.bufferStack.slice(buffer.length + 8)
        callback(socket, socket.chunck.messageIndex, buffer)
        reCheck = socket.chunck.bufferStack.length > 0
      }
    } while (reCheck)
  }
}

module.exports = easysocket

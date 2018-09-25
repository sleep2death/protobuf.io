const protobuf = require('protobufjs')
const _ = require('lodash')

class transport {
  constructor () {
    this.protocol = null
    this.indexStart = 1000
    this.index = {}
  }

  loadProtocol (path) {
    return new Promise((resolve, reject) => {
      protobuf.load(path, (err, root) => {
        if (err) {
          reject(err)
          return
        }
        this.protocol = root

        // build the index
        var idx = this.indexStart
        for (var key in this.protocol.nested) {
          var obj = this.protocol.nested[key]
          obj.idx = idx

          this.index[idx++] = obj
        }

        resolve(this)
      })
    })
  }

  encode (type, payload) {
    var builder = null

    // find the packet builder
    if (_.isNumber(type)) {
      builder = this.index[type]
    } else if (_.isString(type)) {
      builder = this.protocol.lookupType(type)
    }

    if (!builder) {
      return { errMsg: 'can not find the type: ' + type }
    }

    var errMsg = builder.verify(payload)
    if (errMsg) {
      return { errMsg: 'payload invalid: ' + errMsg }
    }

    return { index: builder.idx, buffer: builder.encode(builder.create(payload)).finish() }
  }

  decode (type, buffer) {
    var builder = null

    if (_.isNumber(type)) {
      builder = this.index[type]
    } else if (_.isString(type)) {
      builder = this.protocol.lookupType(type)
    }

    if (!builder) {
      return { errMsg: 'can not find the type: ' + type }
    }

    try {
      var msg = builder.decode(buffer)
      var result = msg.toJSON()
      result.mType = msg.$type.name
      return result
    } catch (error) {
      return { errMsg: 'can not decode the buffer: ' + error.message }
    }
  }

  _prepareSocket (socket) {
    socket.chunck = {
      messageSize: 0,
      messageType: 0,
      buffer: Buffer.alloc(0),
      bufferStack: Buffer.alloc(0)
    }
  }

  send (socket, payload, callback) {
    if (!socket.chunck) this._prepareSocket(socket)

    var buffer = Buffer.from(payload.buffer)
    var consolidatedBuffer = Buffer.alloc(8 + buffer.length)

    consolidatedBuffer.writeInt32LE(buffer.length, 0)
    consolidatedBuffer.writeInt32LE(payload.index, 4) // message type
    buffer.copy(consolidatedBuffer, 8)

    socket.write(consolidatedBuffer, function (err) {
      if (err) throw err

      if (callback) {
        callback(socket)
      }
    })
  }

  recieve (socket, pb, callback) {
    if (!socket.chunck) this._prepareSocket(socket)

    socket.chunck.bufferStack = Buffer.concat([socket.chunck.bufferStack, pb])

    var reCheck = false
    do {
      reCheck = false
      if (socket.chunck.messageSize === 0 && socket.chunck.bufferStack.length >= 8) {
        socket.chunck.messageSize = socket.chunck.bufferStack.readInt32LE(0)
        socket.chunck.messageType = socket.chunck.bufferStack.readInt32LE(4)
      }

      if (socket.chunck.messageSize !== 0 && socket.chunck.bufferStack.length >= socket.chunck.messageSize + 8) {
        var buffer = socket.chunck.bufferStack.slice(8, socket.chunck.messageSize + 8)
        socket.chunck.messageSize = 0
        socket.chunck.bufferStack = socket.chunck.bufferStack.slice(buffer.length + 8)
        callback(socket, socket.chunck.messageType, buffer)
        reCheck = socket.chunck.bufferStack.length > 0
      }
    } while (reCheck)
  }
}

transport.protocol = null
transport.indexStart = 1000
transport.index = {}

module.exports = transport

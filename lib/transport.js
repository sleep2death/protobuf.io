const protobuf = require('protobuf.js')
const _ = require('lodash')

class transport {
  static loadProtocols (path) {
    return new Promise((resolve, reject) => {
      protobuf.load(path, (err, root) => {
        if (err) reject(err)
        transport.protocol = root

        // build the index
        var idx = transport.indexStart
        for (var key in transport.protocol.nested) {
          var obj = transport.protocol.nested[key]
          obj.idx = idx

          transport.protocolIndex[idx++] = obj
        }
      })
    })
  }

  static encode (type, payload) {
    var builder = null

    // find the packet builder
    if (_.isNumber(type)) {
      builder = transport.index[type]
    } else if (_.isString(type)) {
      builder = transport.protocol.lookupType(type)
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

  static decode (type, buffer) {
    var builder = null

    if (_.isNumber(type)) {
      builder = transport.index[type]
    } else if (_.isString(type)) {
      builder = transport.protocol.lookupType(type)
    }

    if (!builder) {
      return { errMsg: 'can not find the type: ' + type }
    }

    try {
      var msg = builder.decode(buffer)
      return { msg, name: builder.name }
    } catch (error) {
      return { errMsg: 'can not decode the buffer: ' + error.message }
    }
  }
}

transport.indexStart = 1000
transport.index = {}

module.exports = transport

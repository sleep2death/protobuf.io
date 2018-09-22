const protobuf = require('protobufjs')
const Promise = require('bluebird')
const _ = require('lowdash')
const logger = require('../utils/logger')

var Transport = {
  _indexStart: 1000,
  _root: {},
  _index: {},
  _createIndex: function (root) {
    var idx = Transport._indexStart
    for (var key in Transport._root.nested) {
      var obj = Transport._root.nested[key]
      Transport._index[idx++] = obj
    }
  },
  // load the protocols
  loadProtocol: function (path) {
    return new Promise((resolve, reject) => {
      protobuf.load(path, (err, root) => {
        if (err) reject(err)
        this._root = root
        Transport._createIndex(this._root)
        logger.info('protocol file loaded')
        resolve(this)
      })
    })
  },
  // send the message to client
  encode: function (type, payload) {
    var builder = null

    // find the packet builder
    if (type && _.isNumber(type)) {
      builder = Transport._index[type]
    } else if (type && _.isString(payload)) {
      builder = Transport._root.lookupType(type)
    }

    if (!builder) return logger.error('can not find the type: [%s]', type)

    var errMsg = builder.verify(payload)
    if (errMsg) return logger.error('payload invalid: %s', errMsg)

    // var buffer = builder.encode(builder.create(payload)).finish()
  },
  decode: function (type, payload) {
  }
}

module.exports = Transport

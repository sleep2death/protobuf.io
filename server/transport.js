const protobuf = require('protobufjs')
const Promise = require('bluebird')
const logger = require('../utils/logger')

var Transport = {
  _indexStart: 1000
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
  send: function (socket, type, payload) {
  },
  receive: function (payload) {
  },
}

module.exports = Transport

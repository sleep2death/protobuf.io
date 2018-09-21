const protobuf = require('protobufjs')
const Promise = require('bluebird')
const logger = require('../utils/logger')

var Transport = {
  _root: {},
  _index: {},
  _createIndex: function (root) {
    var idx = 1000
    for (var key in Transport._root.nested) {
      var obj = Transport._root.nested[key]
      Transport._index[idx++] = obj
    }
  },
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
  }
}

module.exports = Transport

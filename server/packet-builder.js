const protobuf = require('protobufjs')
const Promise = require('bluebird')
const _ = require('lodash')
const logger = require('../utils/logger')

var builder = {
  _indexStart: 1000,
  _root: {},
  _index: {},
  _createIndex: function (root) {
    var idx = builder._indexStart
    for (var key in builder._root.nested) {
      var obj = builder._root.nested[key]
      obj.idx = idx
      builder._index[idx++] = obj
    }
  },
  // load the protocols
  loadProtocol: function (path) {
    return new Promise((resolve, reject) => {
      protobuf.load(path, (err, root) => {
        if (err) reject(err)
        this._root = root
        builder._createIndex(this._root)
        logger.info('protocol file loaded')
        resolve(this)
      })
    })
  },
  // send the message to client
  encode: function (type, payload) {
    var creator = null

    // find the packet builder
    if (_.isNumber(type)) {
      creator = builder._index[type]
    } else if (_.isString(type)) {
      creator = builder._root.lookupType(type)
    }

    if (!creator) {
      logger.error('can not find the type: [%s]', type)
      return null
    }

    var errMsg = creator.verify(payload)
    if (errMsg) {
      logger.error('payload invalid: %s', errMsg)
      return null
    }

    return { index: creator.idx, buffer: creator.encode(creator.create(payload)).finish() }
  },
  decode: function (type, buffer) {
    var creator = null

    if (_.isNumber(type)) {
      creator = builder._index[type]
    } else if (_.isString(type)) {
      creator = builder._root.lookupType(type)
    }

    if (!creator) {
      logger.error('can not find the type: [%s]', type)
      return null
    }

    try {
      var msg = creator.decode(buffer)
      return { msg, name: creator.name }
    } catch (error) {
      logger.error('can not decode the buffer: [%s]', error.message)
      return null
    }
  }
}

module.exports = builder

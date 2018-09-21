const logger = require('../utils/logger')
const shortid = require('shortid')

const Client = function (server, conn, id) {
  this.server = server
  this.conn = conn
  this.id = id

  this.connected = true
  this.disconnected = false

  this.init()
}

Client.prototype.init = function () {
  this.conn.on('data', this.ondata.bind(this))
  this.conn.on('error', this.onerror.bind(this))
  this.conn.on('close', this.onclose.bind(this))
}

Client.prototype.close = function () {
  try {
    this.conn.destroy()
  } catch (error) {
    logger.error('client [%s] error %s:', this.id, error.message)
  }
}

Client.prototype.ondata = function (data) {
  logger.info(data)
}

Client.prototype.onerror = function (error) {
  logger.error('client [%s] error %s:', this.id, error.message)
}

Client.prototype.onclose = function () {
  this.cleanup()
  logger.info('client closed %s', this.id)
}

Client.prototype.cleanup = function () {
  this.conn.removeAllListeners()
  delete Client.connections[this.id]

  this.connected = false
  this.disconnected = true

  this.conn = null
  this.server = null
}

Client.add = function (server, conn) {
  var id = shortid.generate()
  var client = new Client(server, conn, id)
  Client.connections[id] = client

  return id
}

Client.disconnectAll = function () {
  for (var key in Client.connections) {
    Client.connections[key].close()
  }
}

Client.connections = {}

module.exports = Client

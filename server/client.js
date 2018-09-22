const shortid = require('shortid')
const logger = require('../utils/logger')

// client constructor 
const Client = function () {
  this.server = null // the server ref
  this.conn = null // the socket client ref
  this.id = null // the uid

  this.readystate = 'idle' // client state

  this.checkIntervalTimer = null // interval of checking state
  this.pingTimeoutTimer = null // interval of the ping timeout
}

// set up the client instance, and open the client
Client.prototype.setup = function (server, conn, id) {
  this.server = server
  this.conn = conn
  this.id = id

  this.readyState = 'opening'

  this.conn.on('data', this.ondata.bind(this))
  this.conn.on('error', this.onerror.bind(this))
  this.conn.on('close', this.onclose.bind(this))

  this.onOpen()
}

Client.prototype.onOpen = function () {
  this.readyState = 'open'
}

Client.prototype.ondata = function (data) {
  logger.info(data)
}

Client.prototype.close = function () {
  try {
    this.conn.destroy()
  } catch (error) {
    logger.error('client [%s] error %s:', this.id, error.message)
  }
}

Client.prototype.onerror = function (error) {
  logger.error('client [%s] error %s:', this.id, error.message)
}

Client.prototype.onclose = function () {
  logger.info('client closed %s', this.id)
  this.cleanup()
}

Client.prototype.cleanup = function () {
  this.conn.removeAllListeners()
  delete Client.connections[this.id]

  this.connected = false

  this.conn = null
  this.server = null

  Client.pool.recycle(this)
}

Client.add = function (server, conn) {
  var id = shortid.generate()
  var client = Client.pool.use()
  client.setup(server, conn, id)
  Client.connections[id] = client

  return id
}

Client.disconnectAll = function () {
  for (var key in Client.connections) {
    Client.connections[key].close()
  }
}

Client.getConnectionsCount = function () {
  return Object.keys(Client.connections).length
}

Client.pool = require('deepool').create(() => {
  return new Client()
})

Client.connections = {}

module.exports = Client

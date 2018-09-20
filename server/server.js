const net = require('net')
const logger = require('../utils/logger')
const Promise = require('bluebird')

const Server = function () {
  if (!(this instanceof Server)) {
    return new Server()
  }
  this.tcpServer = net.createServer()
}

Server.prototype.start = function (port) {
  return new Promise((resolve, reject) => {
    // set the port
    PortAvailable(port).then(port => {
      logger.silly('port' + port + ' is available!')
      this.port = port

      try {
        this.tcpServer.listen(this.port, () => {
          logger.info('start listening on %d', this.port)

          this.tcpServer.on('connection', this.onconnection.bind(this))
          this.tcpServer.on('error', this.onerror.bind(this))
          this.tcpServer.on('close', this.onclose.bind(this))

          resolve(this)
        })
      } catch (error) {
        reject(error)
      }
    }).catch(error => {
      reject(error)
    })
  })
}

Server.prototype.onerror = function (error) {
  logger.error('server error:', error)
}

Server.prototype.onconnection = function (socket) {
  logger.info('got a client connected %o', socket.address())
}

Server.prototype.onclose = function () {
  logger.error('server closed')
}

module.exports = Server

function PortAvailable (port) {
  return new Promise((resolve, reject) => {
    const portReg = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/g
    if (!portReg.test(String(port))) {
      reject(new Error('invalid port input'))
      return
    }

    const tester = net.createServer()
      .once('error', error => { reject(error) })
      .once('listening', () => tester.once('close', () => resolve(port)).close())
      .listen(port)
  })
}

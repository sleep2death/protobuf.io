const Server = require('../server/index')
const logger = require('../utils/logger')

describe('Server', function () {
  describe('#init()', function () {
    it('create the server with invalid port', done => {
      var server = new Server({ port: 'invalid port' })
      // should throw an error event
      server.on('error', error => {
        logger.silly(error.message)
        done()
      })
    })

    it('create the server', done => {
      var server = new Server({ port: 3000 })
      server.on('listening', () => {
        done()
      })
    })
  })
})

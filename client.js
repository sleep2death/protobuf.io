const isPortAvailable = require('is-port-available')

isPortAvailable(3000).then(status => {
  if (status) {
    console.log('Port ' + 3000 + ' IS available!')
  } else {
    console.log('Port ' + 3000 + ' IS NOT available!')
    console.log('Reason : ' + isPortAvailable.lastError)
  }
})

isPortAvailable(3000).then(status => {
  if (status) {
    console.log('Port ' + 3000 + ' IS available!')
  } else {
    console.log('Port ' + 3000 + ' IS NOT available!')
    console.log('Reason : ' + isPortAvailable.lastError)
  }
})

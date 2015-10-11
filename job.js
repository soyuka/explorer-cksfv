var Promise = require('bluebird')
var crc = require('crc')
var fs = Promise.promisifyAll(require('fs'))
var eol = require('os').EOL
var p = require('path')

function CksfvJob(ipc) {
  if(!(this instanceof CksfvJob)) { return new CksfvJob(ipc) }
  this.ipc = ipc
}

CksfvJob.prototype.check = function(user, path) {
  var self = this

  this.ipc.send('cksfv:notify', user.username, {message: 'Starting crc check on '+path})

  fs.readFileAsync(path)
  .then(function(data) {
    var map = []

    data = data.toString().split(eol)

    return Promise.map(data, function(line) {
      if(!line.trim())
        return Promise.resolve()

      var original = line.trim().slice(-8)
      var filepath = line.slice(0, -9).trim()

      map[filepath] = {original: original}

      return fs.readFileAsync(p.resolve(p.dirname(path), filepath))
      .then(function(buffer) {
        var str = crc.crc32(buffer).toString(16)

        while(str.length < 8) {
          str = '0'+str 
        }
      
        map[filepath].calculate = str

        return map
      })
    })
    .then(function() {
      var wrong = []
      var errors = 0

      for(var i in map) {
        if(map[i].original !== map[i].calculate) {
          wrong[i] = map[i] 
          errors++
        }
      }

      if(errors === 0) {
        self.ipc.send('cksfv:notify', user.username, {
          message: 'Cksfv done without errors',
          path: path
        }) 
      } else {
        var text = ''

        for(var i in wrong) {
          var e = wrong[i]        
          text += 'CRC for path ' + i + ' does not match (expect '+e.original+' to equal '+e.calculate+') ' 
        }

        return self.ipc.send('cksfv:notify', user.username, {message: text, error: true})
      }
    })
  })
  .catch(function(err) {
     self.ipc.send('cksfv:notify', user.username, {message: 'Error while reading '+path + '('+err.message+')', error: true})
  })
}

module.exports = CksfvJob

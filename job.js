var Promise = require('bluebird')
var crc = require('crc')
var fs = Promise.promisifyAll(require('fs'))
var eol = require('os').EOL
var p = require('path')

function CksfvJob(ipc, stat) {
  if(!(this instanceof CksfvJob)) { return new CksfvJob(ipc, stat) }
  this.ipc = ipc
  this.stat = stat
}

CksfvJob.prototype.check = function(user, path) {
  var self = this

  this.stat.add(user.username, {message: 'Starting crc check on '+path})

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
        self.stat.add(user.username, {message: 'Every crc32 of '+path+' is a perfect match!', path: path}) 
      } else {
        var text = ''

        for(var i in wrong) {
          var e = wrong[i]        
          text += 'CRC for path ' + i + ' does not match (expect '+e.original+' to equal '+e.calculate+') ' 
        }

        return self.stat.add(user.username, {error: text})
      }
    })
  })
  .catch(function(err) {
     self.stat.add(user.username, {error: 'Error while reading '+path + '('+err.message+')'})
     return self.ipc.send('error', err.stack)
  })
}

CksfvJob.prototype.info = function() {
  return this.stat.get()
}

CksfvJob.prototype.clear = function(user) {
  return this.stat.remove(user)
}

module.exports = CksfvJob

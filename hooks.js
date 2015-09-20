function registerHooks(config) {
  return {
    element: function(item) {
      if(item.ext == '.sfv') {
        return '<a href="/p/cksfv?path='+item.path+'">Cksfv</a>'
      }

      return ''
    } 
  }
}

module.exports = registerHooks

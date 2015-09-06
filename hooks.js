function registerHooks(config) {
  return {
    element: function(item) {
      if(item.ext == '.sfv') {
        return '<a href="/plugin/cksfv?path='+item.path+'">Cksfv</a>'
      }

      return ''
    } 
  }
}

module.exports = registerHooks

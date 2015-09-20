function registerHooks(config, route) {
  return {
    element: function(item) {
      if(item.ext == '.sfv') {
        return '<a href="'+route+'?path='+item.path+'">Cksfv</a>'
      }

      return ''
    } 
  }
}

module.exports = registerHooks

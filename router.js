var CksfvRouter = function(app, utils) {
  app.get('/plugin/cksfv', utils.prepareTree, function(req, res, next) {
    utils.interactor.ipc.send('call', 'cksfv.check', req.user, req.query.path)

    return res.handle('back', {info: 'Cksfv launched'}, 201)
  })

  return app
}

module.exports = CksfvRouter

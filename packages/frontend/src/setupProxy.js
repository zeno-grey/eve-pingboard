const { createProxyMiddleware } = require('http-proxy-middleware')

const proxyMiddleware = createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
})

module.exports = function (app) {
  app.use('/auth', proxyMiddleware)
  app.use('/api', proxyMiddleware)
}

const express = require('express')
const debug = require('debug')('app:server')
const webpack = require('webpack')
const webpackConfig = require('../build/webpack.config')
const config = require('../config')
const proxyconfig = require('../config/proxy.conf')
const proxy = require('express-http-proxy')

const app = express()
const paths = config.utils_paths
const _host = process.argv[2]
console.log(_host,"hostC");
app.get( '/hello', function(req,res){
      console.log("heheh");
      res.json({
        hello:"xxxx"
      });
  });
//代理装饰
function decorateProxy(){
	return {
		forwardPath: function(req, res) {
			const url = require('url').parse(req.url).path

			console.log("HTTP代理请求URL: " + url)

			return require('url').parse(req.url).path
		},
		decorateRequest: function(req){
			// req.Cookie = proxyconfig.cookie
			return req
		}
	}
}

app.all( '/apilog/*', proxy( proxyconfig.host[_host], decorateProxy() ))

// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement universal
// rendering, you'll want to remove this middleware.
app.use(require('connect-history-api-fallback')())

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (config.env === 'development') {
  const compiler = webpack(webpackConfig)
console.log("debug");
  debug('Enable webpack dev and HMR middleware')
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath  : webpackConfig.output.publicPath,
    contentBase : paths.client(),
    hot         : true,
    quiet       : config.compiler_quiet,
    noInfo      : config.compiler_quiet,
    lazy        : false,
    stats       : config.compiler_stats
  }))
  app.use(require('webpack-hot-middleware')(compiler))

  // Serve static assets from ~/src/static since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(express.static(paths.client('static')))
  // app.all( proxyconfig.server.from, proxy( proxyconfig.host[_host], decorateProxy() ))
  // app.get( '/hello', function(req,res){
  //     console.log("heheh");
  //     res.json({
  //       hello:"xxxx"
  //     });
  // });
  //  app.all( 'apilog/getconditiondata', proxy( proxyconfig.host[_host], decorateProxy() ))

} else {
  debug(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  )

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(paths.dist()))
}

module.exports = app

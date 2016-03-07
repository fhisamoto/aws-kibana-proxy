var commandLineArgs = require('command-line-args')
var cli = commandLineArgs([
  { name: 'config', alias: 'c', type: String }
])

var cmdLineOpts = cli.parse()
if (cmdLineOpts.config) {
  var config = JSON.parse(require('fs').readFileSync(cmdLineOpts.config, 'utf8'));
}

var http = require('http');
var httpProxy = require('http-proxy')
var express = require('express');
var bodyParser = require('body-parser')
var stream = require('stream')
var sessions = require("client-sessions")

var AwsES = require('./lib/aws_es')

var awsEs = new AwsES(config.es)
var proxy = httpProxy.createProxyServer({
  target: awsEs.endpoint(),
  changeOrigin: true,
  secure: true
});

var app = express()
app.use(bodyParser.raw({ type: '*/*' }));
app.use(sessions({ cookieName: 'session', secret: config.session_secret }))

var googleOauth = require('./lib/google-oauth')
googleOauth.setupOAuth(express, app, config.auth)

app.use(
  function(req, res, next) {
    if (req.session.authenticated) {
      return next()
    }
    req.session.beforeLoginURL = req.url
    res.redirect('/auth/google')
  },
  function (req, res, next) {
    var bufferStream;
    if (Buffer.isBuffer(req.body)) {
      var bufferStream = new stream.PassThrough();
      bufferStream.end(req.body);
    }
    proxy.web(req, res, {buffer: bufferStream});
  }
)

proxy.on('proxyReq', function (proxyReq, req, res, options) {
  var request = awsEs.createRequest(req)
  request.method = proxyReq.method;

  request.path = proxyReq.path;
  if (Buffer.isBuffer(req.body)) {
    request.body = req.body
  }
  awsEs.signer(request, this.credentials)

  proxyReq.setHeader('Host', request.headers['Host']);
  proxyReq.setHeader('X-Amz-Date', request.headers['X-Amz-Date']);
  proxyReq.setHeader('Authorization', request.headers['Authorization']);
});

http.createServer(app).listen(config.port, '0.0.0.0');
console.log("server is up and running @ :" + config.port)

var AWS = require('aws-sdk')

module.exports = function(config) {
  var config = config

  this.endpoint = function() {
    return 'https://' + config.host
  }

  this.signer = function(request) {
    (new AWS.Signers.V4(request, 'es')).addAuthorization(config.credentials, new Date())
  }

  this.createRequest = function(req) {
    var request = new AWS.HttpRequest(new AWS.Endpoint(config.host));
    request.region = config.region
    if (!request.headers) {
      request.headers = {}
    }
    request.headers['Host'] = config.host
    request.headers['presigned-expires'] = false
    return request
  }

  return this;
}

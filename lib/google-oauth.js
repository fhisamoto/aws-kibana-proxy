var request = require('request')
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

exports.setupOAuth = function(express, app, config) {
  console.log('Google OAuth2 authentication used')

  passport.serializeUser(function(user, done) {
    done(null, user)
  })

  passport.deserializeUser(function(obj, done) {
    done(null, obj)
  })

  var callbackUrl = 'http://' + config.host + '/auth/callback'

  var strategy = new GoogleStrategy(
    {
      clientID: config.oauth_client_id, clientSecret: config.oauth_client_secret, callbackURL: callbackUrl
    },
    function(accessToken, refreshToken, profile, done) {
      var callback = function(succeed, msg) {
        return succeed ? done(null, profile): done(null, false, { message: msg })
      }
      findUser(profile, accessToken, config, callback)
    }
  )
  passport.use(strategy)

  app.use(passport.initialize())
  app.use(passport.session())

  app.get('/auth/callback', passport.authenticate('google', { failureRedirect: '/auth/google/fail' }), function(req, res) {
      req.session.authenticated = true
      res.redirect(req.session.beforeLoginURL || '/')
    }
  )

  app.get('/auth/google/fail', function(req, res) {
    res.statusCode = 403
    res.end('<html><body>Unauthorized</body></html>')
  })

  var scope = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
  app.get('/auth/google', passport.authenticate('google', { scope: scope }), function(req, res) {})
}

function findUser(profile, accessToken, config, callback)  {
  var username = profile.displayName || 'unknown';
  var email = profile.emails[0].value || '';
  var domain = profile._json.domain || '';
  if ( (email.split('@')[1] === config.allowed_domain) || domain === config.allowed_domain ) {
    return callback(true, username)
  } else {
    console.log('access refused to: ' + username + ' (email=' + email + ';domain=' + domain + ')');
    return callback(false, username + ' is not authorized')
  }
}

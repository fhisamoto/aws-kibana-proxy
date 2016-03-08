# aws-kibana-proxy

A proxy for AWS kibana.

## Usage

Set config.json in conf directory, follow the sample:

```
{
  "session_secret": "dont share the secret",
  "port": 3000,
  "es": {
    "host": "the-search-host.us-east-1.es.amazonaws.com",
    "region": "us-east-1",
    "credentials": {
      "accessKeyId": "access_key_id",
      "secretAccessKey": "secret_access_key"
    }
  },
  "auth": {
    "host": "myhost.com",
    "oauth_client_id": "my_client_id.apps.googleusercontent.com",
    "oauth_client_secret": "oauth_secret",
    "allowed_domain": "myoauthdomain.com"
  }
}
```

To run in docker container:

```bash
  $ docker run -d -v $(pwd)/conf:/conf -p 3000:3000 99taxis/aws-kibana-proxy
```

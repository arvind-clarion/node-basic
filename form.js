const NODE_ENV  = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const HTTP          = require('http');
const FS            = require('fs');
const Redis         = require("redis");
const URL           = require('url');

const Config = {
  redis: {
    port: 6379,
    host: '127.0.0.1',
    db: 9
  },
  http: {
    bind: '127.0.0.1',
    port: 1990
  }
}

function Service(env, config) {
  this.config = config;
  this.login = FS.readFileSync(__dirname + "/login.html").toString('utf8');
}
Service.prototype = {
  listen: function(ready) {
    this.rs = Redis.createClient(this.config.redis.port, this.config.redis.host);
    this.rs.select(this.config.redis.db);
    this.app = HTTP.createServer(this.respond.bind(this));
    this.app.listen(this.config.http.port, this.config.http.bind, ready.bind(this));
  },
  respond: function(req, res) {
    var uri = URL.parse(req.url, true);
    if (uri.pathname == '/') {
      this.actionIndex(uri, req, res);
      return
    } else if (uri.pathname == '/login') {
      this.actionLogin(uri, req, res);
    }
  },
  actionIndex: function(uri, req, res) {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write(this.login);
    res.end();
  },
  actionLogin: function(uri, req, res) {
  }
}

var service = new Service(NODE_ENV, Config);

service.listen(function() {
  console.log("Server running at http://" + this.config.http.bind + ":" + this.config.http.port + "/");
});

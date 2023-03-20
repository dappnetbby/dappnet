
var net = require('net'),
  socks = require('./socks.js'),
  info = console.log.bind(console);


// Create server
// The server accepts SOCKS connections. This particular server acts as a proxy.
const HOST = '0.0.0.0';
const PORT = '6801';

server = socks.createServer(function (socket, port, address, proxy_ready) {
  let host = address
  console.log(host)

  // let tld = host.slice(-3);
  const tlds = 'eth dappnet ipfs'.split(' ')
  let handledByDappnet = false
  for (let tld of tlds) {
    if (host.endsWith(tld)) handledByDappnet = true
  }

  if (handledByDappnet) {
    // Fetch from the local gateway.
    address = 'localhost'

    if (port == 80) {
      port = 10422
    } else {
      port = 10424
    }
  }

  // Implement your own proxy here! Do encryption, tunnelling, whatever! Go flippin' mental!
  // I plan to tunnel everything including SSH over an HTTP tunnel. For now, though, here is the plain proxy:

  var proxy = net.createConnection({ port: port, host: address, localAddress: undefined }, proxy_ready);
  var localAddress, localPort;

  proxy.on('connect', function () {
    info('%s:%d <== %s:%d ==> %s:%d',
      // Local (Chrome).
      socket.remoteAddress,
      socket.remotePort,
      // SOCKS proxy.
      proxy.localAddress,
      proxy.localPort,
      // Remote target.
      proxy.remoteAddress,
      proxy.remotePort
    );
    localAddress = proxy.localAddress;
    localPort = proxy.localPort;
  }.bind(this));

  proxy.on('data', function (d) {
    try {
      //console.log('receiving ' + d.length + ' bytes from proxy');
      if (!socket.write(d)) {
        proxy.pause();

        socket.on('drain', function () {
          proxy.resume();
        });
        setTimeout(function () {
          proxy.resume();
        }, 100);
      }
    } catch (err) {
    }
  });
  socket.on('data', function (d) {
    // If the application tries to send data before the proxy is ready, then that is it's own problem.
    try {
      //console.log('sending ' + d.length + ' bytes to proxy');
      if (!proxy.write(d)) {
        socket.pause();

        proxy.on('drain', function () {
          socket.resume();
        });
        setTimeout(function () {
          socket.resume();
        }, 100);
      }
    } catch (err) {
    }
  });

  proxy.on('error', function (err) {
    //console.log('Ignore proxy error');
  });
  proxy.on('close', function (had_error) {
    try {
      if (localAddress && localPort)
        console.log('The proxy %s:%d closed', localAddress, localPort);
      else
        console.error('Connect to %s:%d failed', address, port);
      socket.end();
    } catch (err) {
    }
  }.bind(this));

  socket.on('error', function (err) {
    //console.log('Ignore socket error');
  });
  socket.on('close', function (had_error) {
    try {
      if (this.proxy !== undefined) {
        proxy.removeAllListeners('data');
        proxy.end();
      }
      //console.error('The socket %s:%d closed',socket.remoteAddress,socket.remotePort);
    } catch (err) {
    }
  }.bind(this));

}, false && { username: undefined, password: undefined });

server.on('error', function (e) {
  console.error('SERVER ERROR: %j', e);
  if (e.code == 'EADDRINUSE') {
    console.log('Address in use, retrying in 10 seconds...');
    setTimeout(function () {
      console.log('Reconnecting to %s:%s', HOST, PORT);
      server.close();
      server.listen(PORT, HOST);
    }, 10000);
  }
});

function start() {
  return server.listen(PORT, HOST);
}

module.exports = { start }
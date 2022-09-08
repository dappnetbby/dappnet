// Cluster socks5 proxy server bundle with nexe.js
// Usage: socks5.node cores port host
// Copyright (c) 2016 Tom Zhou(iwebpp@gmail.com)

var net = require('net'),
    socks = require('./socks.js'),
    info = console.log.bind(console);

const cluster = require('cluster');
const numCPUs = process.argv[2] ? parseInt(process.argv[2]) : require('os').cpus().length;


if (cluster.isMaster) {
  //console.log('cluster settings:%j',cluster.settings);
  console.log('master argv:%j',process.argv);
  
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  ///console.log('worker argv:%j',process.argv);
  
  // Workers can share any TCP connection
  // Create server
  // The server accepts SOCKS connections. This particular server acts as a proxy.
  var HOST = process.argv[6] || '0.0.0.0',
      PORT = process.argv[5] || '6801',
      server = socks.createServer(function(socket, port, address, proxy_ready) {

      // Implement your own proxy here! Do encryption, tunnelling, whatever! Go flippin' mental!
      // I plan to tunnel everything including SSH over an HTTP tunnel. For now, though, here is the plain proxy:

      var proxy = net.createConnection({port:port, host:address}, proxy_ready);
      var localAddress,localPort;
      proxy.on('connect', function(){
        info('%s:%d <== %s:%d ==> %s:%d',socket.remoteAddress,socket.remotePort,
              proxy.localAddress,proxy.localPort,proxy.remoteAddress,proxy.remotePort);
        localAddress=proxy.localAddress;
        localPort=proxy.localPort;

        proxy.pipe(socket).pipe(proxy);
      }.bind(this));

      proxy.on('error', function(err){
          //console.log('Ignore proxy error');
      });
      proxy.on('close', function(had_error) {
        try {
          if(localAddress && localPort)
            console.log('The proxy %s:%d closed', localAddress, localPort);
          else 
            console.error('Connect to %s:%d failed', address, port);
          socket.end();
        } catch (err) {
        }
      }.bind(this));
      
      socket.on('error', function(err){
          //console.log('Ignore socket error');
      });
      socket.on('close', function(had_error) {
        try {
          if (this.proxy !== undefined) {
            proxy.end();
          }
          //console.error('The socket %s:%d closed',socket.remoteAddress,socket.remotePort);
        } catch (err) {
        }
      }.bind(this));

    }, process.argv[7]&&process.argv[8]&&{username:process.argv[7],password:process.argv[8]});

  server.on('error', function (e) {
     server.close();
     server.listen(PORT, HOST);
  });

  server.listen(PORT, HOST);

}


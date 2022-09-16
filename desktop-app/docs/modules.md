So basically:

ipfs-http-client requires importing via an ES6 module syntax
unfortunately, electron-builder fucks with the import paths, so it cannot find this when it's specified using a dynamic import a la `await import('ipfs-http-client')`


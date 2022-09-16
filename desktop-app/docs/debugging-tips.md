## macOS pkg's.

```sh

# Streams output of pkg install to file.
tail -f /var/log/install.log > pkg-install-debug

# Installs .pkg.
sudo installer -pkg dist/Dappnet-1.0.0-arm64.pkg  -target / -verbose
```
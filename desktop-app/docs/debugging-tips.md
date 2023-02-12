# macOS

## macOS pkg's.

```sh
# Installs .pkg.
sudo installer -pkg dist/Dappnet-1.0.0-arm64.pkg  -target / -verbose

# The output is sent to /var/log/install.log.
# An easy way of capturing this is as so:
tail -f /var/log/install.log > pkg-install-debug
```
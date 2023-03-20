# macOS

## macOS pkg's.

```sh
# Installs .pkg.
sudo installer -pkg dist/Dappnet-1.0.0-arm64.pkg -target / -verbose

# The output is sent to /var/log/install.log.
# An easy way of capturing this is as so:
tail -f /var/log/install.log > pkg-install-debug
```

An example of the output:

```
2023-03-10 12:22:21+11 Mac-mini installer[62872]: Current Path: /usr/bin/sudo
2023-03-10 12:22:21+11 Mac-mini installd[1942]: PackageKit: Adding client PKInstallDaemonClient pid=62872, uid=0 (/usr/sbin/installer)
2023-03-10 12:22:21+11 Mac-mini installer[62872]: PackageKit: Enqueuing install with framework-specified quality of service (utility)
2023-03-10 12:22:21+11 Mac-mini installd[1942]: PackageKit: Set reponsibility for install to 12425
2023-03-10 12:22:21+11 Mac-mini installd[1942]: PackageKit: ----- Begin install -----
2023-03-10 12:22:21+11 Mac-mini installd[1942]: PackageKit: request=PKInstallRequest <1 packages, destination=/>
2023-03-10 12:22:21+11 Mac-mini installd[1942]: PackageKit: packages=(
	    "PKLeopardPackage <id=eth.dappnet, version=1.6.0, url=file:///Users/liamz/Documents/Projects/dappnet/desktop-app/dist/Dappnet-1.6.0-arm64.pkg#eth.dappnet.pkg>"
	)
2023-03-10 12:22:21+11 Mac-mini installd[1942]: PackageKit: Extracting file:///Users/liamz/Documents/Projects/dappnet/desktop-app/dist/Dappnet-1.6.0-arm64.pkg#eth.dappnet.pkg (destination=/Library/InstallerSandboxes/.PKInstallSandboxManager/9AB2D272-5D4D-468D-B7F4-D3579F260F43.activeSandbox/Root/Applications, uid=0)
2023-03-10 12:22:23+11 Mac-mini installd[1942]: PackageKit: prevent user idle system sleep
2023-03-10 12:22:23+11 Mac-mini installd[1942]: PackageKit: suspending backupd
2023-03-10 12:22:23+11 Mac-mini installd[1942]: PackageKit: Using trashcan path /var/folders/zz/zyxvpxvq6csfxvn_n0000000000000/T/PKInstallSandboxTrash/9AB2D272-5D4D-468D-B7F4-D3579F260F43.sandboxTrash for sandbox /Library/InstallerSandboxes/.PKInstallSandboxManager/9AB2D272-5D4D-468D-B7F4-D3579F260F43.activeSandbox
2023-03-10 12:22:23+11 Mac-mini installd[1942]: PackageKit: Shoving /Library/InstallerSandboxes/.PKInstallSandboxManager/9AB2D272-5D4D-468D-B7F4-D3579F260F43.activeSandbox/Root (1 items) to /
2023-03-10 12:22:23+11 Mac-mini install_monitor[62883]: Temporarily excluding: /Applications, /Library, /System, /bin, /private, /sbin, /usr
2023-03-10 12:22:23+11 Mac-mini installd[1942]: PackageKit (package_script_service): Preparing to execute script "./postinstall" in /private/tmp/PKInstallSandbox.k2VdrE/Scripts/eth.dappnet.1RGouZ
2023-03-10 12:22:23+11 Mac-mini package_script_service[27737]: PackageKit: Executing script "postinstall" in /tmp/PKInstallSandbox.k2VdrE/Scripts/eth.dappnet.1RGouZ
2023-03-10 12:22:23+11 Mac-mini package_script_service[27737]: Set responsibility to pid: 12425, responsible_path: /Applications/iTerm.app/Contents/MacOS/iTerm2
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: + echo /tmp/PKInstallSandbox.k2VdrE/Scripts/eth.dappnet.1RGouZ/postinstall
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: /tmp/PKInstallSandbox.k2VdrE/Scripts/eth.dappnet.1RGouZ/postinstall
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: + ls /tmp/PKInstallSandbox.k2VdrE/Scripts/eth.dappnet.1RGouZ/postinstall
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: /tmp/PKInstallSandbox.k2VdrE/Scripts/eth.dappnet.1RGouZ/postinstall
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: + echo /Users/liamz/Documents/Projects/dappnet/desktop-app/dist/Dappnet-1.6.0-arm64.pkg
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: /Users/liamz/Documents/Projects/dappnet/desktop-app/dist/Dappnet-1.6.0-arm64.pkg
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: + echo /Applications
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: /Applications
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: + ls /Applications/Dappnet.app/
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: Contents
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: + echo /
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: /
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: + echo Creating CA...
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: Creating CA...
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: + DAPPNET_APP_PATH=/Applications/Dappnet.app
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: + cd /Applications/Dappnet.app/Contents/Resources/app.asar.unpacked/node_modules/@dappnet/local-gateway/dappnet-ca/
2023-03-10 12:22:24+11 Mac-mini package_script_service[27737]: ./postinstall: + ./create-ca.sh
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + '[' -f ca.crt ']'
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + '[' -f ca.key ']'
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + mkdir data/
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + cd data/
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + openssl genrsa -out ca.key 2048
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: Generating RSA private key, 2048 bit long modulus
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: .............................................................+++
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: ...........................+++
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: e is 65537 (0x10001)
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + openssl req -x509 -new -nodes -subj '/C=US/O=Dappnet CA/CN=Dappnet certificates' -key ca.key -sha256 -days 3650 -out ca.crt
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + openssl rsa -in ca.key -pubout
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: writing RSA key
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + openssl rsa -in ca.key -out ca.2.key
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: writing RSA key
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + openssl pkcs12 -export -in ca.crt -inkey ca.key -out ca.p12 -passout pass:/dev/null
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + echo Installing CA...
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: Installing CA...
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: ++ pwd
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + CERT=/Applications/Dappnet.app/Contents/Resources/app.asar.unpacked/node_modules/@dappnet/local-gateway/dappnet-ca/data/ca.crt
2023-03-10 12:22:25+11 Mac-mini package_script_service[27737]: ./postinstall: + sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain /Applications/Dappnet.app/Contents/Resources/app.asar.unpacked/node_modules/@dappnet/local-gateway/dappnet-ca/data/ca.crt
2023-03-10 12:22:30+11 Mac-mini package_script_service[27737]: ./postinstall: + sudo security verify-cert -c /Applications/Dappnet.app/Contents/Resources/app.asar.unpacked/node_modules/@dappnet/local-gateway/dappnet-ca/data/ca.crt
2023-03-10 12:22:30+11 Mac-mini package_script_service[27737]: ./postinstall: ...certificate verification successful.
2023-03-10 12:22:30+11 Mac-mini package_script_service[27737]: Responsibility set back to self.
2023-03-10 12:22:30+11 Mac-mini installd[1942]: PackageKit: Writing receipt for eth.dappnet to /
2023-03-10 12:22:33+11 Mac-mini installd[1942]: oahd translated /Applications/Dappnet.app/Contents/Resources/app.asar.unpacked/vendor/ipfs/kubo_v0.18.1_darwin-amd64/ipfs
2023-03-10 12:22:33+11 Mac-mini installd[1942]: oahd translated /Applications/Dappnet.app/Contents/Resources/app.asar.unpacked/vendor/local-proxy/merino
2023-03-10 12:22:33+11 Mac-mini installd[1942]: PackageKit: Translated 2 binaries.
2023-03-10 12:22:33+11 Mac-mini installd[1942]: PackageKit: Touched bundle /Applications/Dappnet.app
2023-03-10 12:22:33+11 Mac-mini installd[1942]: PackageKit: Touched bundle /Applications/Dappnet.app/Contents/Frameworks/Dappnet Helper (GPU).app
2023-03-10 12:22:33+11 Mac-mini installd[1942]: PackageKit: Touched bundle /Applications/Dappnet.app/Contents/Frameworks/Dappnet Helper (Plugin).app
2023-03-10 12:22:33+11 Mac-mini installd[1942]: PackageKit: Touched bundle /Applications/Dappnet.app/Contents/Frameworks/Dappnet Helper (Renderer).app
2023-03-10 12:22:33+11 Mac-mini installd[1942]: PackageKit: Touched bundle /Applications/Dappnet.app/Contents/Frameworks/Dappnet Helper.app
2023-03-10 12:22:33+11 Mac-mini installd[1942]: Installed "Dappnet" (1.6.0)
2023-03-10 12:22:33+11 Mac-mini install_monitor[62883]: Re-included: /Applications, /Library, /System, /bin, /private, /sbin, /usr
2023-03-10 12:22:34+11 Mac-mini installd[1942]: PackageKit: releasing backupd
2023-03-10 12:22:34+11 Mac-mini installd[1942]: PackageKit: allow user idle system sleep
2023-03-10 12:22:34+11 Mac-mini installd[1942]: PackageKit: ----- End install -----
2023-03-10 12:22:34+11 Mac-mini installd[1942]: PackageKit: 13.0s elapsed install time
2023-03-10 12:22:34+11 Mac-mini installd[1942]: PackageKit: Cleared responsibility for install from 62872.
2023-03-10 12:22:34+11 Mac-mini installd[1942]: PackageKit: Running idle tasks
2023-03-10 12:22:34+11 Mac-mini installd[1942]: PackageKit: Done with sandbox removals
2023-03-10 12:22:34+11 Mac-mini installer[62872]: PackageKit: Registered bundle file:///Applications/Dappnet.app/ for uid 0
2023-03-10 12:22:34+11 Mac-mini installer[62872]: PackageKit: Registered bundle file:///Applications/Dappnet.app/Contents/Frameworks/Dappnet%20Helper%20(GPU).app/ for uid 0
2023-03-10 12:22:34+11 Mac-mini installer[62872]: PackageKit: Registered bundle file:///Applications/Dappnet.app/Contents/Frameworks/Dappnet%20Helper%20(Plugin).app/ for uid 0
2023-03-10 12:22:34+11 Mac-mini installer[62872]: PackageKit: Registered bundle file:///Applications/Dappnet.app/Contents/Frameworks/Dappnet%20Helper%20(Renderer).app/ for uid 0
2023-03-10 12:22:34+11 Mac-mini installer[62872]: PackageKit: Registered bundle file:///Applications/Dappnet.app/Contents/Frameworks/Dappnet%20Helper.app/ for uid 0
2023-03-10 12:22:34+11 Mac-mini installd[1942]: PackageKit: Removing client PKInstallDaemonClient pid=62872, uid=0 (/usr/sbin/installer)
2023-03-10 12:22:35+11 Mac-mini installer[62872]: Running install actions
2023-03-10 12:22:35+11 Mac-mini installer[62872]: Removing temporary directory "/var/folders/zz/zyxvpxvq6csfxvn_n0000000000000/T//Install.62872QO6BHT"
2023-03-10 12:22:35+11 Mac-mini installer[62872]: Finalize disk "Macintosh HD"
2023-03-10 12:22:35+11 Mac-mini installer[62872]: Notifying system of updated components
2023-03-10 12:22:35+11 Mac-mini installer[62872]: 
2023-03-10 12:22:35+11 Mac-mini installer[62872]: **** Summary Information ****
2023-03-10 12:22:35+11 Mac-mini installer[62872]:   Operation      Elapsed time
2023-03-10 12:22:35+11 Mac-mini installer[62872]: -----------------------------
2023-03-10 12:22:35+11 Mac-mini installer[62872]:        disk      0.02 seconds
2023-03-10 12:22:35+11 Mac-mini installer[62872]:      script      0.00 seconds
2023-03-10 12:22:35+11 Mac-mini installer[62872]:        zero      0.00 seconds
2023-03-10 12:22:35+11 Mac-mini installer[62872]:     install      14.44 seconds
2023-03-10 12:22:35+11 Mac-mini installer[62872]:     -total-      14.46 seconds
2023-03-10 12:22:35+11 Mac-mini installer[62872]: 
```
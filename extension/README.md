extension
=========

Extension for:

 * Firefox.
 * Chrome.

## Acknowledgements.

This was originally based off [chrome-bit-domain-extension](https://github.com/Tagide/chrome-bit-domain-extension.git), who built an extension for the original decentralized DNS, Namecoin / .bit domains. 

## Setup.

```sh
cp .env.example .env
# Insert your extension store API keys if need be.

# Install from package-lock.json. Very important.
npm ci
```

## Build.

```sh
# Chrome.
npm run build:chrome

# Firefox.
npm run build:firefox
```

## Distribute.

```sh
# Chrome.
./scripts/dist-chrome.sh

# Firefox.
./scripts/dist-firefox.sh
```
## Future.

 * Improve gateway/proxy performance.
 * IPFS monitoring stats - # seeders etc.

## Releases.

## 1.7.1

 * Fix: open links in default internet browser. Note: users are using the `chrome-0.2.0` extension with Brave! `0.3.0` will not work with Brave. https://github.com/liamzebedee/dappnet/issues/30
 * Fix: notarize macOS .pkg installer. https://github.com/liamzebedee/dappnet/issues/32

## 1.7.0

 * Chrome extension now reports live connection to Dappnet app.
 * Chrome extension published in web store! Thanks to @saeta-eth for doing the work here https://github.com/liamzebedee/dappnet/pull/22
 * Added basic telemetry for launch - we're tracking information to ensure we can be data-driven about improving the product, and ensuring it has good UX (with respect to ENS and IPFS resolution times). Details are located in [./desktop-app/docs/telemetry.md](./desktop-app/docs/telemetry.md).
 * Generate the root CA per-install, and move it into the Dappnet data directory (https://github.com/liamzebedee/dappnet/issues/28). This was the final part of the PoC which needed to be productionized.

## 1.6.0

 - IPFS links in-browser.

## 1.5.0

 * **Massive performance improvements**.
   * Moved proxy and gateway into their own separate background processes.
   * Streaming HTTP responses from IPFS to the gateway to the user.
   * Replace `fetch` with Node HTTP, use keepalive and larger connection pool.
   * Improved .eth lookup by 50% by optimistically fetching from default resolver using multicall.
   * Upgraded `ipfs` to v0.18, and applied the `lowpower` configuration which reduces battery/CPU/network consumption by a lot. Thanks to Elpranocotro from their Discord for helping out.

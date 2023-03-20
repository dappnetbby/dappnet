## Future.

 * Improve gateway/proxy performance.
 * IPFS links in-browser.
 * IPFS monitoring stats - # seeders etc.

## Unreleased.

 * **Massive performance improvements**.
   * Moved proxy and gateway into their own separate background processes.
   * Streaming HTTP responses from IPFS to the gateway to the user.
   * Replace `fetch` with Node HTTP, use keepalive and larger connection pool.
   * Improved .eth lookup by 50% by optimistically fetching from default resolver using multicall.
   * Upgraded `ipfs` to v0.18, and applied the `lowpower` configuration which reduces battery/CPU/network consumption by a lot. Thanks to Elpranocotro from their Discord for helping out.


dappnet-deploy
==============

A tool to publish a directory to IPFS, and update the IPNS record. Works for remote nodes.

## Usage.

```sh
ipfs key generate
ipfs key export mergeswap --format=pem-pkcs8-cleartext
export DAPPNET_IPNS_KEY=$(cat ./mergeswap.pem)

# Deploy.
node src/index.js deploy --ipns --dir ../out
```

## Output.

```
$ node src/index.js deploy --ipns --dir ../out
Importing key...
Publishing files to IPFS...
  /ipfs/QmbHjMBB47b1LNF5h9omWc1pTMnUN57FSscR2MY4jK74Eh/ /_next/static/chunks/86-4d9226cb4747c42d.js
  /ipfs/QmfN1E2yxmgNhCRUhLjKeGNFKnJZ188igGX3UeENRtjNaq/ /_next/static/chunks/framework-4556c45dd113b893.js
  /ipfs/QmTQ9oGdQJkPpqLXYudz6bNmhDNVTi9rRB9eZtFJWjiGEQ/ /_next/static/chunks/main-84ef8f6faac559d3.js
  /ipfs/QmdL7zBQ1RkUcTRLs88cFhrTMRPd13QwaeQxzS4EQPUNM9/ /_next/static/chunks/pages/_app-727966ad737097ae.js
  /ipfs/QmRba5NiEsgSHuWo9N8C5VkTNgC9woTKvhhV6PNsZx8f3Y/ /_next/static/chunks/pages/_error-a4ba2246ff8fb532.js
  /ipfs/QmQDMJQUF3wQe4HM6MGpdNzn4kpuWTZZmPzwSQz9V9tB6r/ /_next/static/chunks/pages/index-b4899c12d0bbf97f.js
  /ipfs/QmczMcZyTHZhnrUjkdWumLLjo5MVLZMGKxNGFFF8A8Jm6F/ /_next/static/chunks/polyfills-c67a75d1b6f99dc8.js
  /ipfs/QmQ8LxxayGdsmc6RbK7huD74jGJXRW5cJSA37FcV9Y3Rem/ /_next/static/chunks/webpack-5761f3a204ffdf4a.js
  /ipfs/QmScM15arqwuHpt8k8Eombg3JZxDBbPqSXNh82GGmrNP5e/ /_next/static/css/fc431f147a6e358e.css
  /ipfs/QmNYysv7dBNPVc7w5zVnaxzDBYvQZWdzz5XmWjgDE1FtGH/ /_next/static/ggIF0ERHNigQld2_g_UYv/_buildManifest.js
  /ipfs/QmfTHYvGk4kopjd8UYSw4kuCiqVUJM149zGDVZi5UR5YLr/ /_next/static/ggIF0ERHNigQld2_g_UYv/_ssgManifest.js
  /ipfs/Qmf4iC5Tp3rx4LFHFdeAffRQpWHoY7gvyJ8wrrSvNJiJdp/ /404.html
  /ipfs/QmYeHBCHWbeAyk4CepzfSFqnR3YpKrAk4oASFcyE22P7zg/ /favicon.ico
  /ipfs/Qmc8jDEzgvJfExNvKjREgo2vv8R8hhRZtsxszHZFWU7PJH/ /index.html
  /ipfs/QmP6c1jTXErF8MjgCRW6HUjfukaZMsxCPap1B615u8qTgx/ /logo.svg
  /ipfs/QmQJo9GWEGgP2iDsyyx59Am6UVSAWpjB35tCstTDfk1SiE/ /metadata/android-chrome-192x192.png
  /ipfs/QmaEjynsyaKxS2vS6UNBC5athyWoHVLhvkNtsFdUNbnz7r/ /metadata/apple-touch-icon.png
  /ipfs/QmQm8pc48UkAx4sWBrsc97qwgMugqeUwEkFyr32pPBTEaj/ /metadata/favicon-16x16.png
  /ipfs/Qmer1KMecHQnuxNx9JLDp4vCAAccfDWoWuDMgoY7VjFeXb/ /metadata/favicon-32x32.png
  /ipfs/QmQybs7DVGf5N4xco3Xod3dmgeE19kXdxe6KFzy8pyrVAN/ /metadata/miniature.png
  /ipfs/QmWtD3sXHADz78xh7tP9cc5p3UoMY74zUXkPZTSdFS42qz/ /metadata/site.webmanifest
  /ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/ /_next/ggIF0ERHNigQld2_g_UYv
  /ipfs/QmXqsMEghtPt4gWPVnUoRUfGHtQFpmkWVBnrR1dcwmL7ni/ /_next/static/chunks/pages
  /ipfs/QmbMyqobeYWzgPCsuieAzE1AftphSeUAnffV2DKtAUFJxW/ /_next/static/chunks
  /ipfs/QmTLDB6Bd7BVxLqoxUgXACPinYLfHsPmJwA48ZeX5bfiSK/ /_next/static/css
  /ipfs/QmevjHjVzVbpHEAd6tvXB4cgPCoW9rBstk9pMCFhZ9XRm6/ /_next/static/ggIF0ERHNigQld2_g_UYv
  /ipfs/QmQAJoAjMsVi1Ae7VrU9PA19iPU6kZsuWBV8QZov8y7qVB/ /_next/static
  /ipfs/QmQunFPpyvujtmu1hTcL1LV1iPuJzusrnTYkPSh7MtSpHM/ /_next
  /ipfs/QmWzdwW6g3CnTFjos8oF7rLUpmXSa6tv6d1ggudZLq4g6X/ /metadata
  /ipfs/QmZ789gvozmvgWAiX5XNqmRxkPEWhg3FkbZF1TmEnCjYzw/ /
Updating IPNS record...
    Key: /ipns/k51qzi5uqu5dkis8wej6ca0jvp2xk7mhhk1c1fx3fiu9i7qv6tqjp3qhocor49
  Value: /ipfs/QmZ789gvozmvgWAiX5XNqmRxkPEWhg3FkbZF1TmEnCjYzw
Done
Your site should be available on these gateways soon:
  https://cloudflare-ipfs.com/ipfs/QmZ789gvozmvgWAiX5XNqmRxkPEWhg3FkbZF1TmEnCjYzw/
  https://ipfs.fleek.co/ipfs/QmZ789gvozmvgWAiX5XNqmRxkPEWhg3FkbZF1TmEnCjYzw/
```
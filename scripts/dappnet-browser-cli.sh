
# Run chrome headless.
alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
chrome --load-extension /Users/liamz/Documents/Projects/dappnet/extension/dist/dappnet-extension_chrome_0.1.6 --new-window --app=https://uniswap.eth

# Run carbonyl headless HEADLESS.
docker pull carbonyl/carbonyl
docker create --name carbdapp carbonyl/carbonyl
docker exec -ti carbdapp /bin/bash
/carbonyl/carbonyl --no-sandbox --disable-dev-shm-usage --proxy-server=socks://host.docker.internal:6801 http://kwenta.eth


./carbonyl --no-sandbox --disable-dev-shm-usage --proxy-server=socks://localhost:6801 http://youtube.eth
#!/bin/sh
set -ex
export DEBUG="electron-osx-sign" 
node ./scripts/mac/sign.js
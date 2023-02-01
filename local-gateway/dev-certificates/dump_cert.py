import sys
import json

# read contents of ca.crt
cert = open('./ca.crt', 'r').read()
pubkey = open('./ca.pubkey', 'r').read()
prvkey = open('./ca.key', 'r').read()
prvkey2 = open('./ca.2.key', 'r').read()

print(json.dumps({
    'cert': cert,
    'pubkey': pubkey,
    'prvkey': prvkey,
    'prvkey2': prvkey2
}, indent=4))
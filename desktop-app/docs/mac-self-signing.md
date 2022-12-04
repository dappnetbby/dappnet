```sh
# disable gatekeeper
sudo spctl --master-disable
sudo spctl --status

# now build and notarize.

# re-enable.
sudo spctl --master-enable
```
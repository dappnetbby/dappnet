Contains build resources for the macOS app distribution.

See `electron-builder.yml` for where these are used.

## The macOS .pkg installer.

The installer has a script to automatically install the CA on the user's system. This is the best UX I've found so far, since it requires the user authenticating as root in order to modify the system keychain.

See `dist-resources/pkg/mac`.
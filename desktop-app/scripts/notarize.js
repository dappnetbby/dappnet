// 
// Performs notarization of the Dappnet app for macOS.
// 

require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
    if(process.env.SKIP_NOTARIZE) {
        return
    }

    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        tool: 'notarytool',
        appBundleId: 'eth.dappnet',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLEID,
        appleIdPassword: process.env.APPLEIDPASS,
        teamId: process.env.APPLETEAMID,
    });
};
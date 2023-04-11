// 
// Performs notarization of the Dappnet app for macOS.
// 

require('dotenv').config();
const { notarize } = require('electron-notarize');
const { spawn } = require("child_process");
const os = require("os");

exports.default = async function notarizing(context) {
    console.log(`[dappnet-build] Running notarization...`);

    if(process.env.SKIP_NOTARIZE) {
        console.log(`[dappnet-build] Skipping notarization...`)
        return
    }
    
    const {
        APPLEID,
        APPLEIDPASS,
        APPLETEAMID,
    } = process.env;

    if (!APPLEID || !APPLEIDPASS || !APPLETEAMID) {
        throw new Error('missing environment variables: APPLEID, APPLEIDPASS, APPLETEAMID');
        return;
    }

    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') {
        throw new Error("Code notarization is only implemented for macOS");
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

// exports.default = async function notarizing(context) {
//     console.log(`[dappnet-build] Running code signing...`);
//     // return
//     // TODO: I don't even think it actually runs this script.
//     // LOL.
//     // if(process.env.SKIP_NOTARIZE) {
//     //     return
//     // }

//     const {
//         APPLEID,
//         APPLEIDPASS,
//         APPLETEAMID,
//     } = process.env;

//     // Check environment variables.
//     if (!APPLEID || !APPLEIDPASS || !APPLETEAMID) {
//         throw new Error('missing environment variables: APPLEID, APPLEIDPASS, APPLETEAMID');
//         return;
//     }

//     // Check platform.
//     const { artifactPaths } = context;
//     if (os.platform() !== "darwin") {
//         console.log("Not notarizing app because not running on MacOS.");
//         return;
//     }

//     console.log(JSON.stringify(artifactPaths, null, 1))
//     return

//     const appName = context.packager.appInfo.productFilename;

//     return await notarize({
//         tool: 'notarytool',
//         appBundleId: 'eth.dappnet',
//         appPath: `${appOutDir}/${appName}.app`,
//         appleId: process.env.APPLEID,
//         appleIdPassword: process.env.APPLEIDPASS,
//         teamId: process.env.APPLETEAMID,
//     });
// };



// exports.default = async function notarizing(context) {
//     console.log(`[dappnet-build] Running code signing...`);
    
//     // if(process.env.SKIP_NOTARIZE) {
//     //     return
//     // }

//     const {
//         APPLEID,
//         APPLEIDPASS,
//         APPLETEAMID,
//     } = process.env;
    
//     // Check environment variables.
//     if (!APPLEID || !APPLEIDPASS || !APPLETEAMID) {
//         throw new Error('missing environment variables: APPLEID, APPLEIDPASS, APPLETEAMID');
//         return;
//     }

//     // Check platform.
//     const { artifactPaths } = context;
//     if (os.platform() !== "darwin") {
//         console.log("Not notarizing app because not running on MacOS.");
//         return;
//     }

//     console.log(JSON.stringify(context, null, 1))
//     return

//     // const appName = context.packager.appInfo.productFilename;
//     // return await notarize({
//     //     tool: 'notarytool',
//     //     appBundleId: 'eth.dappnet',
//     //     appPath: `${appOutDir}/${appName}.app`,
//     //     appleId: process.env.APPLEID,
//     //     appleIdPassword: process.env.APPLEIDPASS,
//     //     teamId: process.env.APPLETEAMID,
//     // });
// };




// exports.default = async function notarizing(context) {
//     const { artifactPaths } = context;
//     if (os.platform() !== "darwin") {
//         console.log("Not notarizing app because not running on MacOS.");
//         return;
//     }
//     console.log("Notarizing app...");
//     const filename = artifactPaths.find((p) => p.endsWith(".pkg"));
//     if (!filename) {
//         console.log("Could not find pkg artifact. Exit");
//         process.exit(1);
//     }
//     console.log(`Found artifact: ${filename}`);

//     const auth = `--apple-id ${process.env.APPLEID} --password "${process.env.APPLEIDPASS}" --team-id ${process.env.APPLETEAMID}`;
//     const content = await exec(`xcrun notarytool submit ${filename} ${auth} --wait`);

//     const uuid = content.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)[0];
//     await exec(`xcrun notarytool log ${uuid} ${auth}`);
//     await exec(`xcrun stapler staple ${filename}`);

//     console.log("App notarized successfully.");
// };

function exec(cmd) {
    return new Promise((resolve, reject) => {
        console.log(cmd);
        const proc = spawn(cmd, [], { shell: true });

        const chunks = [];
        proc.stdout.on("data", (data) => {
            console.log(data.toString());
            chunks.push(data);
        });
        proc.stderr.on("data", (data) => {
            console.error(data.toString());
            chunks.push(data);
        });
        proc.on("close", (code) => {
            console.log(`Process exited with code ${code}.`);
            resolve(Buffer.concat(chunks).toString("utf8"));
        });
    });
}
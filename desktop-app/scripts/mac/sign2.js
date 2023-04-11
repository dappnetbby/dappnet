require("dotenv").config();
const { spawn } = require("node:child_process");
const os = require("os");

exports.default = async function notarizing(context) {
    const { artifactPaths } = context;
    if (os.platform() !== "darwin") {
        console.log("Not notarizing app because not running on MacOS.");
        return;
    }
    console.log("Notarizing app...");
    const filename = artifactPaths.find((p) => p.endsWith(".pkg"));
    if (!filename) {
        console.log("Could not find pkg artifact. Exit");
        process.exit(1);
    }
    console.log(`Found artifact: ${filename}`);

    const auth = `--apple-id ${process.env.APPLEID} --password "${process.env.APPLEIDPASS}" --team-id ${process.env.APPLETEAMID}`;
    const content = await exec(`xcrun notarytool submit ${filename} ${auth} --wait`);

    const uuid = content.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)[0];
    await exec(`xcrun notarytool log ${uuid} ${auth}`);
    await exec(`xcrun stapler staple ${filename}`);

    console.log("App notarized successfully.");
};

const auth = `--apple-id ${process.env.APPLEID} --password "${process.env.APPLEIDPASS}" --team-id ${process.env.APPLETEAMID}`;
const filename = ""
console.log(`xcrun notarytool submit ${filename} ${auth} --wait`)

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
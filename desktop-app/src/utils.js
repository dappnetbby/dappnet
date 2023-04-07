import { spawn, spawnSync } from 'node:child_process';
import * as sourceMap from 'source-map-support';
sourceMap.install();
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk'

const { Transform } = require('stream');

// Simple stream which prepends service name to each line of its stdout/stderr.
// ie. xyz -> [serviceName] xyz
export class ServiceLoggerStream extends Transform {
    constructor(options, label) {
        super(options);
        this.label = label
    }

    _transform(chunk, encoding, callback) {
        const str = chalk.yellow(`[${this.label}]`) + ' ' + chunk.toString()
        this.push(str)
        callback()
    }
}

export const runBinary = (cmd, args, env, label) => {
    console.log(`launching ${chalk.yellow(label)}`)

    console.log(`[exec] ${cmd} ${args}`)
    const program = spawn(
        cmd,
        args.split(' '),
        {
            env: {
                ...env,
                FORCE_COLOR: true
            },
            stdio: 'pipe'
        }
    );

    program.stdout.on('data', (data) => {
        console.log(`[${chalk.yellow(label)}] ${data}`);
    });

    program.stderr.on('data', (data) => {
        console.log(`[${chalk.yellow(label)}] ${data}`);
    });

    program.on('close', (code) => {
        if (code !== 0) {
            console.log(`[${cmd}] process exited with code ${code}`);
        }
    });
}
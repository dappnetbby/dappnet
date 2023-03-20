import { spawn, spawnSync } from 'node:child_process';
import * as sourceMap from 'source-map-support';
sourceMap.install();
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk'

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
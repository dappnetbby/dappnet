import { spawn, spawnSync } from 'node:child_process';
import * as sourceMap from 'source-map-support';
sourceMap.install();
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk'

export const runBinary = (cmd, args, env, label) => {
    console.log(`executing ${chalk.yellow('[' + label + ']')} ${chalk.green(cmd)} ${chalk.green(args)}`)
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

    process.on('exit', () => {
        // Kill the child process when the parent exits
        if (program.pid) {
            try {
                process.kill(program.pid);
            } catch (err) {
                // Handle any errors if the process is already dead
            }
        }
    });

    program.stdout.on('data', (data) => {
        data.toString().split('\n').forEach(line => {
            console.log(`[${chalk.yellow(label)}] ${line}`);
        })
        // console.log(`[${chalk.yellow(label)}] ${data}`);
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
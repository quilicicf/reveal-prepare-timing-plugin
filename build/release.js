#!/usr/bin/env node

/*
 * This script was only tested on Linux and has no vocation to be adapted to other platforms yet.
 * This is due to the fact I'm the only developer currently anyway, and it's not planned to change anytime soon.
 */

const { yellow } = require('chalk');
const readline = require('readline');
const { resolve: resolvePath } = require('path');

const { version } = require('../package');
const checkGitState = require('./checkGitState');
const execSyncAndShareStdio = require('./execSyncAndShareStdio');

const ROOT_PATH = resolvePath(__dirname, '..');
const DIST_PATH = resolvePath(__dirname, '..', 'dist');

process.chdir(ROOT_PATH);

checkGitState();

const prompter = readline.createInterface({ input: process.stdin, output: process.stdout });
prompter.question('Have you updated and committed the version & changelog? (y/n) ', (answer) => {
  if (answer.toLocaleLowerCase() === 'y') {
    prompter.close();
  } else {
    process.stdout.write(yellow('Please do it now and launch the script again afterwards\n'));
    process.exit(1);
  }
});

prompter.on('close', () => {
  execSyncAndShareStdio(`rm -rf ${DIST_PATH}`);
  execSyncAndShareStdio('npm run build');
  execSyncAndShareStdio('git add . -A');
  execSyncAndShareStdio(`git commit -m ':construction: Release version ${version}'`);
  execSyncAndShareStdio('git push origin master');
  execSyncAndShareStdio(`git tag v${version}`);
  execSyncAndShareStdio(`git push origin v${version}`);
  execSyncAndShareStdio('npm login');
  execSyncAndShareStdio('npm publish');
});

#!/usr/bin/env node

/* eslint-disable global-require,spaced-comment,no-unused-expressions,max-len */

const { existsSync } = require('fs');

const applyTimings = require('./applyTimings');

// noinspection BadExpressionStatementJS
require('yargs')
  .usage('usage: rpt <command>')

  // Public methods
  .command(
    'apply',
    'Apply timing report to source file',
    yargs => yargs
      .usage('usage: rpt apply [options]')
      .option('report-path', {
        alias: 'r',
        describe: 'The path to the report to apply',
        type: 'string',
        demandOption: true,
      })
      .option('source-path', {
        alias: 's',
        describe: 'The path to the source to apply the report to',
        type: 'string',
        demandOption: true,
      })
      .check(({ r: reportPath, s: sourcePath }) => {
        if (!existsSync(reportPath)) { throw Error(`No report file found at ${reportPath}`); }
        if (!existsSync(sourcePath)) { throw Error(`No source file found at ${sourcePath}`); }
        return true;
      })
      .help(),
    applyTimings,
  )

  .command('groot', 'Display a random sentence, in French', () => process.stdout.write('Je s\'appelle Groot\n'))

  .demandCommand(1, 'Specify the command you want to run!')
  .help()
  .version()
  .wrap(null)
  .epilogue('For more information, read the manual at https://github.com/quilicicf/reveal-prepare-timing-plugin')
  .argv;

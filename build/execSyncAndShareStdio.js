const { cyan } = require('chalk');
const { execSync } = require('child_process');

module.exports = (command) => {
  process.stdout.write(cyan(`================\nRunning: ${command}\n`));
  execSync(command, { stdio: 'inherit' });
};

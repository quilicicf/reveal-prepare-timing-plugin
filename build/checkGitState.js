const { yellow } = require('chalk');
const execAndRetrieveStdout = require('./execAndRetrieveStdout');
const isGitDirty = require('./isGitDirty');

module.exports = () => {
  if (isGitDirty()) {
    const gitStatus = execAndRetrieveStdout('git status --short');
    process.stderr.write(yellow(`Your git is not clean. Git status yields:\n${gitStatus}\nOnly release on a clean git repository\n`));
    process.exit(1);
  }
};

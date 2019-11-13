const execAndRetrieveStdout = require('./execAndRetrieveStdout');

module.exports = () => {
  const gitStatus = execAndRetrieveStdout('git status --short');
  if (gitStatus !== '') {
    process.stderr.write(`Your git is not clean. Git status yields:\n${gitStatus}\nOnly release on a clean git repository\n`);
    process.exit(1);
  }
};

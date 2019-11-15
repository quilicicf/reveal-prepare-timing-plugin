const execAndRetrieveStdout = require('./execAndRetrieveStdout');

module.exports = () => {
  const gitStatus = execAndRetrieveStdout('git status --short');
  return gitStatus !== '';
};

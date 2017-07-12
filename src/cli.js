/* eslint-disable global-require */

const minimist = require('minimist');
const { die, bold } = require('./console');
const { version } = require('../package.json');
const { MissingDependencyError } = require('./errors');

const getExecutorForCommand = command => {
  switch (command) {
    case 'update':
    case 'test': {
      return require('./commands/test');
    }
    case 'init': {
      return require('./commands/init');
    }
    default: {
      return die(`Invalid command ${command}`);
    }
  }
};

async function run() {
  const args = process.argv.slice(2);
  const argv = minimist(args);
  const command = argv._[0] || 'test';
  const executor = getExecutorForCommand(command);

  bold(`loki ${command} v${version}`);
  try {
    await executor(args);
  } catch (err) {
    if (err instanceof MissingDependencyError) {
      die(err.message, err.installationInstructions);
    }
    if (err.cmd && err.stderr && err.message.indexOf('Command failed: ') === 0) {
      die(err.stderr);
    }
    die(err);
  }
}

module.exports = run;
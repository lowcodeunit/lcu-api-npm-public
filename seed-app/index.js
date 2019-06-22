const cmdExeq = require('../helpers/cmd.execute');
const npmExeq = require('../helpers/npm.execute');

module.exports = async function(context, req) {
  context.log('Seed App function processing a request...');

  context.log(req.query);

  const inputs = {
    repoOrg: req.query.repoOrg || (req.body && req.body.repoOrg),
    repoName: req.query.repoName || (req.body && req.body.repoName),
    commands: req.query.commands || (req.body && req.body.commands),
    token: req.query.token || (req.body && req.body.token),
    rootDir: `${context.executionContext.functionDirectory}`
  };

  context.log(inputs);

  const repoUrl = `https://${inputs.token}@github.com/${inputs.repoOrg}/${inputs.repoName}.git`;

  await cmdExeq(context, '', 'npm i rimraf git -g');
  
  if (inputs && inputs.repoName && inputs.repoOrg && inputs.commands && inputs.token) {
    const commands = [
      ...loadPrepCommands(inputs),
      `git init`,
      `git pull ${repoUrl}`,
      ...inputs.commands.split('|'),
      // 'git add .',
      // `git commit -a -m 'Seeding repository'`
      ...loadCleanCommands(inputs)
    ];
  
    await cmdExeq(context, '..\\..\\..\\..\\lcu-api-npm-public\\', commands)
      .then(function(results) {
        console.log(results);
      })
      .catch(function(err) {
        console.log(err);
      });
  } else {
    context.res = {
      status: 400,
      body: { Code: 1, Message: `Invalid inputs ${JSON.stringify(inputs)}` }
    };
  }

  console.log(context.res);
};

function loadCleanCommands(inputs) {
  return [
    `cd ..`,
    `rimraf ${inputs.repoName}`
  ];
}

function loadPrepCommands(inputs) {
  return [
    'cd ..',
    `if exist git (echo "git") else (mkdir git)`,
    `cd git`,
    `if exist repos (echo "repos") else (mkdir repos)`,
    `cd repos`,
    `if exist ${inputs.repoOrg} (echo "${inputs.repoOrg}") else (mkdir ${inputs.repoOrg})`,
    `cd ${inputs.repoOrg}`,
    `if exist ${inputs.repoName} (rimraf ${inputs.repoName}) else (echo "clean")`,
    `mkdir ${inputs.repoName}`,
    `cd ${inputs.repoName}`,
    'echo "Repo Directory prepared"'
  ];
}

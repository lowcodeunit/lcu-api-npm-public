const exeq = require("exeq");

module.exports = async function(context, command, blockJsonParse = false) {
    if (command.startsWith("npm ")) command = command.replace("npm ", "");

    var cmd = await exeq(`node node_modules/npm/bin/npm-cli.js ${command}`);

    context.log(cmd);

    var stdOut = cmd[0].stdout;

    context.log(stdOut);

    if (!blockJsonParse) return JSON.parse(stdOut);
    else return stdOut;
};

const exeq = require("exeq");

module.exports = async function(context, command, blockJsonParse = false) {
    if (command.startsWith("npm ")) command = command.replace("npm ", "");

    var cmd = await exeq(`node node_modules/npm/bin/npm-cli.js ${command}`);

    context.log(cmd);

    if (!blockJsonParse) return JSON.parse(cmd[0].stdout);
    else return cmd[0].stdout;
};

const exeq = require("exeq");

module.exports = async function(context, npmRefPath, commands, blockJsonParse = true) {
    if (!Array.isArray(commands)) {
        commands = [commands];
    }
    
    commands = commands.map(command => {
        if (command.startsWith("npm ")) command = command.replace("npm ", `node ${npmRefPath}node_modules\\npm\\bin\\npm-cli.js `);
    
        return command;
    });

    context.log(commands);
    
    var cmd = await exeq(commands);
    
    context.log(cmd);    

    var results = cmd.map(c => {
        if (!blockJsonParse) 
            return JSON.parse(c.stdout);
        else 
            return c.stdout;
    });    

    context.log(results.join('\r\n'))

    return results.join('\r\n');
};

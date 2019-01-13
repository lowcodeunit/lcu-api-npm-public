const npmExeq = require("../helpers/npm.execute");
const azStrgH = require("../helpers/azure.storage");

module.exports = async function (context, req) {
    context.log('NPM Unpack function processing a request...');

    const azStrg = azStrgH(context);
    
    const inputs = {
        pkg: req.query.pkg || (req.body && req.body.pkg),
        version: req.query.version || (req.body && req.body.version),
        entId: req.query.enterpriseId || (req.body && req.body.enterpriseId),
        appId: req.query.applicationId || (req.body && req.body.applicationId)
        // pkg = req.query.pkg || (req.body ? req.body.pkg : ''),
        // version = req.query.version || (req.body ? req.body.version : ''),
        // entId = req.query.enterpriseId || (req.body ? req.body.enterpriseId : ''),
        // appId = req.query.applicationId || (req.body ? req.body.applicationId : '')
    };

    context.log(inputs);
    
    if (inputs && inputs.pkg && inputs.version && inputs.entId && inputs.appId) {
        var results = await npmExeq(context, `i ${inputs.pkg}@${inputs.version}`, true);

        context.log(results);

        var created = await azStrg.EnsureBlobContainer('filesystem');

        context.log(created);
        
        context.res = {
            body: { Code: 0, Message: 'Success' }
        };
    }
    else {
        context.res = {
            status: 400,
            body: { Code: 1, Message: `Invalid inputs ${inputs}` }
        };
    }
};
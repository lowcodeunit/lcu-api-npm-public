const azStrgH = require("../helpers/azure.storage");
const downloadNpmPackage = require("download-npm-package");
var recursive = require("recursive-readdir");
const fs = require("fs-extra");

module.exports = async function(context, req) {
    context.log("NPM Unpack function processing a request...");

    const azStrg = await azStrgH(context);
    
    context.log(req.query);

    const inputs = {
        pkg: req.query.pkg || (req.body && req.body.pkg),
        version: req.query.version || (req.body && req.body.version),
        entId: req.query.enterprise || req.query.enterpriseId || (req.body && req.body.enterpriseId),
        appId: req.query.applicationId || (req.body && req.body.applicationId),
        containerName: "filesystem",
        pkgPath: (process.env['npm-unpack.useLocalDir'] == "true" ? '' : __dirname) + process.env['npm-unpack.pkg-path'],
        rootDir: context.executionContext.functionDirectory
        // pkg = req.query.pkg || (req.body ? req.body.pkg : ''),
        // version = req.query.version || (req.body ? req.body.version : ''),
        // entId = req.query.enterpriseId || (req.body ? req.body.enterpriseId : ''),
        // appId = req.query.applicationId || (req.body ? req.body.applicationId : '')
    };

    context.log(inputs);

    if (inputs && inputs.pkg && inputs.version && inputs.entId && inputs.appId) {
        var pkgAsPath = inputs.pkg.replace("/", "\\");

        await downloadNpmPackage({
            arg: `${inputs.pkg}@${inputs.version}`,
            dir: `${inputs.pkgPath}`
        });

        context.log(`Package files loaded to ${inputs.pkgPath}`);
        
        var pkgFiles = [];

        recursive(`${inputs.pkgPath}\\${pkgAsPath}`, async function(err, files) {
            console.log(err);
            
            pkgFiles.push(...files);
        });

        context.log(pkgFiles);

        var container = await azStrg.EnsureBlobContainer(inputs.containerName);

        context.log(container);

        var fileResults = [];

        var packageJsonPath = pkgFiles.find(pkgFile => pkgFile.endsWith("package.json"));

        var packageJson = await fs.readJSON(packageJsonPath);

        context.log(inputs);

        var creates = pkgFiles.map(pkgFile => {
            context.log(pkgFile);
    
            var seg = `${inputs.entId}\\${inputs.appId}`;

            context.log(inputs.pkgPath);
            context.log(seg);
            
            var blobFilePath = pkgFile.replace(inputs.pkgPath, seg);

            context.log(blobFilePath);
            
            blobFilePath = blobFilePath.replace(pkgAsPath, `${pkgAsPath}\\${packageJson.version}`);

            context.log(blobFilePath);
            
            var content = fs.readFileSync(pkgFile);

            return azStrg.CreateBlob(inputs.containerName, blobFilePath, content);
        });

        var stati = await Promise.all(creates);

        for (let status of stati) {    
            fileResults.push(status);
        }

        context.log(fileResults);
        
        var success = fileResults.every(fileResult => fileResult.Code == 0);

        if (success)
            context.res = {
                body: { Code: 0, Message: "Success", Version: packageJson.version }
            };
        else
            context.res = {
                status: 400,
                body: { Code: 1, Message: `Not all files were successfully uploaded: ` + JSON.stringify(fileResults) }
            };
    } else {
        context.res = {
            status: 400,
            body: { Code: 1, Message: `Invalid inputs ${JSON.parse(inputs)}` }
        };
    }

    console.log(context.res);
};

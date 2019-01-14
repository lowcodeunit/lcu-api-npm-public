const azStrgH = require("../helpers/azure.storage");
const downloadNpmPackage = require("download-npm-package");
var recursive = require("recursive-readdir");
const fs = require("fs-extra");

module.exports = async function(context, req) {
    context.log("NPM Unpack function processing a request...");

    const azStrg = await azStrgH(context);

    const inputs = {
        pkg: req.query.pkg || (req.body && req.body.pkg),
        version: req.query.version || (req.body && req.body.version),
        entId: req.query.enterpriseId || (req.body && req.body.enterpriseId),
        appId: req.query.applicationId || (req.body && req.body.applicationId),
        containerName: "filesystem",
        pkgPath: __dirname + "\\__pkg__",
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

        var pkgFiles = [];

        recursive(`${inputs.pkgPath}\\${pkgAsPath}`, async function(err, files) {
            pkgFiles.push(...files);
        });

        context.log(pkgFiles);

        var container = await azStrg.EnsureBlobContainer(inputs.containerName);

        context.log(container);

        var fileResults = [];

        var packageJsonPath = pkgFiles.find(pkgFile => pkgFile.endsWith("package.json"));

        var packageJson = await fs.readJSON(packageJsonPath);

        for (let pkgFile of pkgFiles) {
            var blobFilePath = pkgFile.replace(inputs.pkgPath, `${inputs.entId}\\${inputs.appId}`).substring(1);

            blobFilePath = blobFilePath.replace(pkgAsPath, `${pkgAsPath}\\${packageJson.version}`);

            var content = await fs.readFile(pkgFile);

            var status = await azStrg.CreateBlob(inputs.containerName, blobFilePath, content);

            status.File = blobFilePath;

            fileResults.push(status);
        }

        context.log(filesResults);
        
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
            body: { Code: 1, Message: `Invalid inputs ${inputs}` }
        };
    }
};

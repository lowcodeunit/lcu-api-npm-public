var azure = require("azure-storage");

module.exports = function(context) {
    var blobService = azure.createBlobService();

    return {
        CreateBlob: function(containerName, blobPath, content) {
            return new Promise((resolve, reject) => {
                blobService.createBlockBlobFromText(containerName, blobPath, content, err => {
                    if (err) {    
                        context.log(err);                    
                        reject(err);
                    } else {
                        context.log("successfully created " + blobPath);
                        resolve({ Code: 0, Message: "Success", File: blobPath });
                    }
                });
            });
        },

        EnsureBlobContainer: function(containerName) {
            return new Promise((resolve, reject) => {
                blobService.createContainerIfNotExists(
                    containerName,
                    {
                        publicAccessLevel: "blob"
                    },
                    function(error, result, response) {
                        if (!error) {
                            context.log(result);
                            resolve(result);
                        } else {
                            context.log(error);
                            reject(error);
                        }
                    }
                );
            });
        }
    };
};

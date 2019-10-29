var azure = require("azure-storage");

module.exports = function(context) {
    var blobService = azure.createBlobService();

    return {
        CreateBlob: function(containerName, blobPath, content) {
            return new Promise((resolve, reject) => {
                blobService.createBlockBlobFromText(containerName, blobPath, content, err => {
                    if (err) {    
                        log(err);                    
                        reject(err);
                    } else {
                        log("successfully created " + blobPath);
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
                            log(result);
                            resolve(result);
                        } else {
                            log(error);
                            reject(error);
                        }
                    }
                );
            });
        }
    };
};

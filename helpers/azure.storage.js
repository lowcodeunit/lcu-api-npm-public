var azure = require("azure-storage");

module.exports = function(context) {
    var blobService = azure.createBlobService();

    return {
        EnsureBlobContainer: function(contaier) {
            return new Promise((resolve, reject) => {
                blobService.createContainerIfNotExists(
                    contaier,
                    {
                        publicAccessLevel: "blob"
                    },
                    function(error, result, response) {
                        if (!error) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
            });
        }
    };
};

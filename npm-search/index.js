const npmExeq = require('../helpers/npm.execute');
const axios = require('axios');

module.exports = async function(context, req) {
  context.log('NPM Search function processed a request.');

  var search = req.query.search || (req.body && req.body.search);

  var version = req.query.version || (req.body && !!req.body.version) || false;

  if (search) {
    try {
      if (version) {
        context.log(`Executing NPM Search for ${search} versions...`);

        var searchResults = await npmExeq(context, `view ${search} versions --json`);

        console.log(searchResults);

        context.log(`NPM Search complete for ${search} versions:`);

        context.res = {
          body: searchResults
        };
      } else {
        context.log(`Executing NPM Search for ${search}...`);

        // var searchResults = await npmExeq(context, `search ${search} --json`);

        axios.get(`https://api.npms.io/v2/search?q=${search}`).then(searchResults => {
          context.log(`NPM Search complete for ${search}:`);

          context.res = {
            body: searchResults
          };
        });
      }
    } catch (err) {
      context.log(err);
      context.res = {
        status: 400,
        body: err
      };
    }
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a search on the query string or in the request body'
    };
  }
};

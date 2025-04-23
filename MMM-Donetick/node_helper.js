const NodeHelper = require("node_helper");
const https = require("https");
const Log = require("logger");

module.exports = NodeHelper.create({
  async socketNotificationReceived(notification, payload) {
    // our notification title
    if (notification === "GET_CHORE_LIST") {

      // Log.info("*** Chore list notification received in donetick! ***");
      const donetickHost = payload.config.serverUrl;
      const apiPath = payload.config.apiPath;
      const secretkey = payload.config.secretkey;

      const options = {
        hostname: donetickHost,
        port: 443,
        path: apiPath,
        method: "GET",
        headers: {
          secretkey: secretkey
        }
      };

      try {
        const req = https.request(options, (res) => {
          // Log.info("***** " + res.statusCode + " *****");

          let rawData = ''

          // collect the chunks as they stream as a series of buffers
          res.on("data", (chunk) => {
            rawData += chunk
          })

          res.on("end", () => {
            if (res.statusCode === 200) {
              try {
                // Log.info("Raw data!: " + rawData)
                this.sendSocketNotification("CHORE_LIST", JSON.parse(rawData))
              } catch(error) {
                Log.error("It's fuckin borked: " + error.message)
              } 
            }
          })
            
        })

        req.on("error", (error) => {
          Log.error(error);
        })

        req.end()
      } catch (error) {
        Log.error("Error in request: " + error.message);
      }
    }
  }
});

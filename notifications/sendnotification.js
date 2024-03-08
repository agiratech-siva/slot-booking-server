
const { google } = require('googleapis');



const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];

function getAccessToken() {
    return new Promise(function(resolve, reject) {
      const key = require('../util/service-account.json');
      const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        SCOPES,
        null
      );
      jwtClient.authorize(function(err, tokens) {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token);
      });
 });
}


async function sendTeamAcceptRejectNotification(token, status,teamName){
  try {
    const bearertoken = await getAccessToken();
    const response = await fetch("https://fcm.googleapis.com/v1/projects/slot-booking-e099d/messages:send", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${bearertoken}`
        },
        body: JSON.stringify({
            "message": {
                "token": `${token}`,
                "data" : {
                  "type": "information",
                  "title": `your team invitation is ${status}`,
                  "body": `team name: ${teamName} `,
                  "teamName" : `${teamName}`,
                  
                },
                "webpush": {
                    "fcm_options": {
                        "link": "http://localhost:7000/"
                    }
                }
            }
        })
    });
    console.log("token fetch result in sendteamacceptrejectnotification");
    const result = await response.json();
    console.log("result", result);
} catch (err) {
  console.log("requested entity not found");
  console.log(err);
}
}



module.exports.getAccessToken = getAccessToken;
module.exports.sendTeamAcceptRejectNotification = sendTeamAcceptRejectNotification;
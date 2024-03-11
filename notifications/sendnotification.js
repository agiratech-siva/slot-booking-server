const { google } = require("googleapis");
const { config } = require("dotenv");
config();

const MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const SCOPES = [MESSAGING_SCOPE];

const getAccessToken = () => {
  return new Promise(function (resolve, reject) {
    try{
      const key = require("../util/service-account.json");
      const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        SCOPES,
        null
      );
      jwtClient.authorize(function (err, tokens) {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token);
      });
    }catch(err){
      console.log(err);
      reject(err);
    }
    
  });
};

const sendTeamStatusNotification = async (
  token,
  status,
  teamName,
  sendername,
  bearertoken
) => {
  try {
    
    const response = await fetch(`${process.env.FCM_API}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearertoken}`,
      },
      body: JSON.stringify({
        message: {
          token: `${token}`,
          data: {
            type: "information",
            status: `${status}`,
            title: `your team invitation is ${status}`,
            body: `team name: ${teamName} `,
            teamName: `${teamName}`,
            senderName: `${sendername}`,
          },
        },
      }),
    });
    if(!response.ok){
      throw new Error("error sending notification");
    }
    const result = await response.json();
    console.log("result", result);

  } catch (err) {
    console.log("requested entity not found");
    console.log(err);
  }

};

const sendTeamAcceptRejectNotification = async (
  token,
  bearertoken,
  notificationRequestId,
  teamName,
  id,
  fullname
) => {
  try {
    const response = await fetch(`${process.env.FCM_API}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearertoken}`,
      },
      body: JSON.stringify({
        message: {
          token: `${token}`,
          data: {
            sendername: `${fullname}`,
            title: `team invitation from ${fullname}}`,
            body: `team name: ${teamName} `,
            teamName: `${teamName}`,
            notificationRequestId: notificationRequestId,
            receiverId: id,
          },
          
        },
      }),
    });

    if(!response.ok){
      throw new Error("error sending notification");
    }

    const result = await response.json();
    console.log(result);

  } catch (err) {
    console.log(err);
  }
};

module.exports.getAccessToken = getAccessToken;
module.exports.sendTeamStatusNotification = sendTeamStatusNotification;
module.exports.sendTeamAcceptRejectNotification = sendTeamAcceptRejectNotification;

const uuid = require('uuid');
const Team = require("../models/team");
const User = require("../models/user");
const {sendTeamStatusNotification,getAccessToken,sendTeamAcceptRejectNotification} = require("../notifications/sendnotification");

exports.getTeamRequests = async (req, res, next) => {
    const id = req.params.id;

    try {
        const data = await User.findOne({employeeId: id}, {teamRequests: true, _id: false});

        if(!data){
            return res.status(404).send({message: "no such user found"});
        }

        res.status(200).send({ message: "successful", data: data });

    } catch (err) {

        console.log(err);
        res.status(500).send({ message: "server error" });
    }

};

exports.teamAcceptRejectNotification =  async (req,res,next) => {
    const {employeeId,teamNotificationId,status,teamname} = req.params;

    try{

        const bearertoken = await getAccessToken();

        let requiredData;
        const user = await User.findOne({employeeId: employeeId});

        if(!user){
            return res.status(404).send({message: "no such user found"});
        }

        user.teamRequests = user.teamRequests.filter((obj) => {
        if(obj.teamNotificationId == teamNotificationId){
            requiredData = obj;
            return false
        }
        return true;
        })

        if(!requiredData){
            return res.status(404).send({message: "notification id not matching"});
        }

        const senderId = requiredData.senderDetails.employee_Id;
        const senderUser = await User.findOne({employeeId: senderId});

        if(!senderUser){
            return res.status(404).send({message: "sender not found"});
        }


        if(status == "true"){
            
            user.teamusersId.push(senderId);
            senderUser.teamusersId.push(employeeId);

            await Team.create({
                name: teamname,
                members: [{ObjectId: user._id, employeeId: user.employeeId}, {ObjectId: senderUser._id, employeeId: senderUser.employeeId}]
            })

            await user.save();
            await senderUser.save();

            if(!bearertoken){
                return res.status(207).send({message: "team is successfully created but failed to send notifications"})
            }

            senderUser.registeredToken.map(registeredToken => {
                sendTeamStatusNotification(registeredToken,'accepted',teamname,senderUser.fullname,bearertoken);
            })

            res.status(200).send({message: "team is created successfully"});
        
        }else{
    
            await user.save();

            if(!bearertoken){
                return res.status(207).send({message: "your team creation is declined and notification system failed to intimate the creator of the team request "})
            }

            senderUser.registeredToken.map(registeredToken => {
                sendTeamStatusNotification(registeredToken,'rejected',teamname, senderUser.fullname,bearertoken);
            })

            res.status(200).send({message: "team invitation is declined by the other team member"});
        
        }
        
    }catch (err){
        console.log(err);
        res.status(500).send({message: "internal server error"});
    }
    
};


exports.sendJoinTeamNotification = async(req,res,next) => {
    const id = req.params.id;
    const senderId = req.params.senderId;
    const teamName = req.params.teamName;
    console.log(id,senderId,teamName);
    try{

        const user = await User.findOne({employeeId: id});
        const senderusername = await User.findOne({employeeId: senderId},{fullname: true, mail: true, _id: false});

        if(!user || !senderusername){
            return res.status(404).send({message: "initiator or receiver not found"});
        }

        const registeredTokens = user.registeredToken;
        const bearertoken = await getAccessToken();

        if(!bearertoken){
            return res.status(500).send({message: "error in getting the authorization token for sending notification"});
        }

        function generateNotificationRequestId() {
            const timestamp = new Date().getTime();
            const uniqueId = uuid.v4();
            const notificationRequestId = `teamnotification_${timestamp}_${uniqueId}`;
            return notificationRequestId;
        }

        const notificationRequestId = generateNotificationRequestId();

        const generate = {
            teamNotificationId: notificationRequestId,
            teamName: teamName,
                senderDetails : {
                    employee_Id: senderId,
                    fullname: senderusername.fullname,
                    mail: senderusername.mail
                }
        }

        user.teamRequests.push(generate);
        await user.save();
    
        registeredTokens.map(async (token) => {
            sendTeamAcceptRejectNotification(token,bearertoken,notificationRequestId,teamName,id,senderusername.fullname);
        });

        res.status(200).send({message: "team request is sent successfully"});

    }catch (err){
        console.log(err);
        res.status(500).send({message: "internal server error , retry team request after some time"});
    }
    
};


exports.getMyTeams = async (req,res,next) => {
    const employee_Id = req.params.id;
    try{
        const response = await Team.find({members: {$elemMatch: {employeeId: employee_Id}}}).populate({
            path: "members.ObjectId",
            select: "fullname mail"
        });

        if(response.length == 0){
            return res.status(404).send({message: "no teams found, create one in the create team section"});
        }

        console.log(typeof response);

        res.status(200).send({message: "your team listing successful.", teams: response});
    }catch(err){
        console.log(err);
        res.status(500).send({message: "internal server error"});
    }

}

exports.getOpponentTeams = async (req,res,next) => {
    const member1 = req.params.member1;
    const member2 = req.params.member2;
    console.log(member1,member2);
    try{

        const response = await Team.find({members: {$not: {
            $elemMatch: {
                $or: [
                    {employeeId: member1},
                    {employeeId: member2}
                ]
            }
        }}}).populate({
            path: "members.ObjectId",
            select: "fullname mail"
        })

        if(response.length == 0){
            return res.status(404).send({message: "no opponent found"});
        }
        
        

        res.status(200).send({message: "opponent teams listed successfully", teams: response});

    }catch(err){

    }
}
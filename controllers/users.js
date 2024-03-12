const User = require("../models/user");

exports.getMyDetails = async (req, res, next) => {
  const id = req.params.id;

  try {
      const userdetails = await User.findOne({ employeeId: id });
      if(!userdetails){
        return res.status(404).send({ message: "User not found" });
      }
      res.status(200).send({ message: "successful", userdetail: userdetails});
         
       
  } catch(err) {
      console.log(err);
      res.status(500).send({message: "server error"});
  }

};

exports.listUsersForTeam = async (req,res,next) => {
    const id = req.params.id;
    try{
        const membersId = await User.findOne({employeeId: id}, {teamusersId: true, _id: false});
        const userslist = await User.find({

          $and: [
            {employeeId: { $nin: membersId.teamusersId }},
            {employeeId: {
              $ne: id
            }}
          ]
        },{fullname: 1, mail: 1, employeeId: 1});

        if(userslist.length == 0){
          return res.status(200).send({message: "no users are left for u to make a team with them", userslist: [], empty: true});
        }

        res.status(200).send({message: "successful", userslist: userslist, empty: false});

    }catch(err){
        console.log(err);
        res.status(500).send({message: "internal server error"});
    }
    
}

exports.addUserToTheDb = async (req, res, next) => {
    const { name, mailId, phone, employeeId } = req.body;

    if(!name || !mailId || !phone || !employeeId){
      return res.status(400).send({message: "something is missing in the request payload"})
    }

    try {
      const user = await User.findOne({ employeeId: employeeId });

      if (!user) {
        await User.create({
          mail: mailId,
          fullname: name,
          phoneNumber: phone,
          employeeId: employeeId,
        });

        return res.status(201).send({message: "inserted details successful" })
      }

      res.status(409).send({ message: "details already present" });

    }catch (err) {
      res.status(500).send({ message: "server error" });
    }
    
};

exports.addRegistrationToken = async (req,res,next) => {
    const id = req.params.id;
    const {token} = req.body;

    if(!token){
      return res.status(400).send({message: "token is missing in the payload"});
    }

    try{
        const response = await User.findOne({employeeId: id});
        const present = response.registeredToken.find((tok) => {
            return tok === token;
        });

        if(!present){
            response.registeredToken.push(token);
            await response.save();
            return res.status(201).send({message: "updated suucessfully"});
        }
        res.status(409).send({message:" already present"});
    }
    catch (err){
        res.status(500).send({message: "internal server error"});
    }
}



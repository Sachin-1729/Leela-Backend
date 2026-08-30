const Users = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


async function signin(req , res)
{
    try {
        const {password , phone} = req.body;
        const User = await Users.findOne({
            where: {
                phone: phone
            }
        });

        if(!User)
        {
              return res.status(401).json({
                message: "Invalid phone or password"
            }); 
        }
        const {dataValues} = User;
    const isMatch = await bcrypt.compare(password, dataValues?.password);
       if (!isMatch) {
            return res.status(401).json({
                message: "Invalid phone or password"
            });
        }

             // Create JWT
        const token = jwt.sign(
            {
                id: dataValues.id,
                phone: dataValues.phone
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "30d"
            }
        );

        return res.status(200).json({
            user : {
                name: dataValues.name,
                id: dataValues.id,
                phone: dataValues.phone
            },
            token: token
        });
    } catch (error) {
          console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }



}

async function users(req , res)
{
   if(req.user)
   {
            return res.status(200).json({
            user : {
                name: req.user.name,
                id: req.user.id,
                phone: req.user.phone
            },
        
        });
   }
}

module.exports = {
    signin,
    users,
}
import UserModel from '../model/User.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ENV from '../config.js';
import otpGenerator from 'otp-generator';

// middleware for verify user....
export async function verifyUser(req, res, next){
    try{
        const {username} = req.method == "GET" ? req.query : req.body;
        // check the user existance
        let exist = await UserModel.findOne({username});
        if(!exist) return res.status(404).send({error: "can't find user!"});
        next();
    }catch(error){
        return res.status(404).send({error: "authentication error"})
    }
}

export async function register(req, res) {
    try {
      const { username, password, profile, email } = req.body;
  
      // Check if the username already exists
      const existingUsername = await UserModel.findOne({ username });
      if (existingUsername) {
        return res.status(400).send({ error: "Please use a unique username" });
      }
  
      // Check if the email already exists
      const existingEmail = await UserModel.findOne({ email });
      if (existingEmail) {
        return res.status(400).send({ error: "Please use a unique email" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new UserModel({
        username,
        password: hashedPassword,
        profile: profile || '',
        email,
      });
  
      // Save the user to the database
      const savedUser = await newUser.save();
  
      res.status(201).send({ msg: "User registered successfully" });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }

export async function login(req, res){
    const {username, password} = req.body;
    try{
        UserModel.findOne({username})
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {
                        if(!passwordCheck) return res.status(400).send({error: "don't have password"});
                        // create jwt token
                        const token = jwt.sign({
                            userId: user._id,
                            username: user.username
                        }, ENV.JWT_SECRET, {expiresIn: "24h"});
                    return res.status(200).send({
                        msg: "login successful...!",
                        username: user.username,
                        token
                    })
                    })
                    .catch(error => {
                        return res.status(400).send({error: "password does not match"})
                    })
            })
            .catch(error => {
                return res.status(404).send({error: "username not found"});
            })
    }catch(error){
        return res.status(500).send({error});
    }
}


export async function getUser(req, res) {
    const { username } = req.params;
    try {
      if (!username) return res.status(400).send({ error: "Invalid username" });
  
      const user = await UserModel.findOne({ username });
  
      if (!user) return res.status(404).send({ error: "User not found" });
  
      //return res.status(200).send(user);

      //remove password from user
      // mongoose return unnecessary data with object so convert it into json
      const {password, ...rest} = Object.assign({}, user.toJSON());
      return res.status(201).send(rest);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal server error" });
    }
}


// export async function updateUser(req, res) { // 02:20:00 for how working with route.
//   try {
//     const id = req.query.id; // Use req.query to get the id from the query parameters
//     if (id) {
//       const body = req.body;
//       const result = await UserModel.updateOne({ _id: id }, body);
//       return res.status(201).send({ msg: "record updated" });
//     } else {
//       return res.status(400).send({ error: "Invalid request" });
//     }
//   } catch (error) {
//     return res.status(500).send({ error: error.message });
//   }
// }
// once you build the update user you can notice when you make a put request on the route you just need to
// get the id of the user and make a request we are only going to allow the authorized user to update 
// their value.
// so we have to call the middleware to this update user to get a token from the user and the pass that to
// this update user. wo when we have a valid login user then we are going to allow user to update their 
// value.
// for that we have to create folder in 'server' name 'middleware' and in this file name 'auth.js'...
export async function updateUser(req, res) { // 02:21:00 to 02:30:00 how to swith basic update to authorized update.
  try {
    //const id = req.query.id; // Use req.query to get the id from the query parameters
    const {userId} = req.user;
    if (userId) {
      const body = req.body;
      const result = await UserModel.updateOne({ _id: userId }, body);
      return res.status(201).send({ msg: "record updated" });
    } else {
      return res.status(400).send({ error: "Invalid request" });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
}

// http://localhost:8000/api/generateOTP
// in 'query' in 'parameter' -> 'username' and in 'value' -> 'nehaJethwani'...
// http://localhost:8000/api/generateOTP?username=nehaJethwani
export async function generateOTP(req, res){
    req.app.locals.OTP = await otpGenerator.generate(6, {lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
    res.status(201).send({code: req.app.locals.OTP})
}

// http://localhost:8000/api/verifyOTP
// and also in 'query' next line 'code' --> '745683'
export async function verifyOTP(req, res){
    const {code}=req.query;
    if(parseInt(req.app.locals.OTP)===parseInt(code)){
      req.app.locals.OTP = null; // reset the OTP value
      req.app.locals.resetSession = true; // start session for reset password
      return res.status(201).send({msg: 'verify successfully'})
    }
    return res.status(400).send({error: 'invalid OTP'})
}

// this is for successfully redirect user when OTP is valid
// we will use this when we build reset session UI...
export async function createResetSession(req, res){
    if(req.app.locals.resetSession){
      req.app.locals.resetSession = false; // allow access to this route only once
      return res.status(201).send({msg: "access granted"})
    }
    return res.status(440).send({error: "session expired!"})
}

// update the password when we have valid sesion....
// for this we have to first generate otp, verify otp and then reset password.
export async function resetPassword(req, res) {
  try {
    if(!req.app.locals.resetSession) return res.status(440).send({error: "session expired"});
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: "Both username and password are required." });
    }

    // Find the user by username
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "Username not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await UserModel.updateOne({ username: user.username }, { password: hashedPassword });

    return res.status(201).json({ msg: "Password updated successfully." });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
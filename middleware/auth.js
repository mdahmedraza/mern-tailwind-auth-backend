//auth middleware
import jwt from 'jsonwebtoken';
import ENV from '../config.js';
export default async function Auth(req, res, next){
    try{
        // access authorize header to validate request
        //when you make a put request you are going to pass the authorization header right inside the 'auth' and then
        //'barrier'. so you have to get login and then get the user token right inside the barrier token. once we have
        //the 'barrier token' we get that using this 'req.headers.authorization' property.
        const token = req.headers.authorization.split(" ")[1]; //.split(" ")[1] -> because we have to seperate 'Bearer' text and empty space.
        // once you have the token inside token variable now we can move on and 
        // retrive the user details of the logged in user.
        const decodedToken = await jwt.verify(token, ENV.JWT_SECRET);
        req.user = decodedToken;
        next()
    }catch(error){
        res.status(401).json({error: "authorization failed.."})
    }
}
// use it in 'route.js'...
// back to the thunder client and let me first register the user click on login route and log in the user get the
// access token so just copy it back to the put 'http://localhost:8000/api/updateuser?id=651669e667712776cb28383c' and inside the 'Auth'->'Bearer' paste the token
// and click on the send button. when you cick on it you will get the response are "Bearer" text with your authentication
// token

// NOTE* if you are using thunder clinet after doing all this related code you might be go to the last
// stage so don't worry about this....

// after all of that for testing it is work or not first 'login' and then copy the token and in
// put-'http://localhost:8000/api/updateuser'. in 'Auth'->'Bearer' paste the token and in body edit./




export function localVariables(req, res, next){
    req.app.locals = {
        OTP : null,
        resetSession: false
    }
    next()
}
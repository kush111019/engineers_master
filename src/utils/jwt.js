const jsonwebtoken = require("jsonwebtoken");

const jwt = {
    //create token
    issueJWT: async user => {
        let payload = {    
        id : user.id, 
        email : user.email  
        };
        const options = {
        expiresIn: '1d'
        };
        const jwtToken = await jsonwebtoken.sign(payload, 'KEy', options)
        return jwtToken;
    },
    //verify Token 
    verifyTokenFn: async (req, res, next) => {
      var token=req.headers.authorization                     
        await jsonwebtoken.verify(token, 'KEy', function(err, decoded)
        {                     
            if (err) {                    
                return res.status(401).json({
                    success: false,
                    message: "Session timed out. Please sign in again",
                });
            }   else {                          
                req.user = {
                    id: decoded.id,  
                    email: decoded.email,               
                }
                return next();
            }
        });
    }
};
module.exports = jwt;
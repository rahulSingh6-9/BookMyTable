
// JWT_SECRET is accessed globally via process.env loaded in entry points


import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
    try{
      const token = req.headers.authorization?.split(' ')[1]

      if(!token){
        return res.status(401).json({ 
          success: false,
          message: "No token provided"
        })
      }

      console.log("🔐 Verifying token with secret:", process.env.JWT_SECRET?.substring(0, 5) + "..."); //++++Testing
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log("auth.middleware.js✅ Token verified, decoded:", decoded); //++++Testing

      req.user = decoded // { _id, role }

      next()
    }catch(error){
        console.error("❌ Token verification failed:", error.message); //++++Testing
        return res.status(401).json({ 
          success: false,
          message: "Invalid or expired token"
        })
    }
}
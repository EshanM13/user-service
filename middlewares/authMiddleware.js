const jwt = require('jsonwebtoken');
const CustomError = require('../errors/customErrors');
const config = require('../config/config');

const authMiddleware = async(req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new CustomError('Authorization header not found', 400);
        }

        const tokenParts = authHeader.split(' ');

        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            throw new CustomError('Invalid token format', 400);
        }

        const token = tokenParts[1];

        const decoded = await jwt.verify(token, config.SECRET_ACCESS_TOKEN);
        req.user = decoded;
        next();
    }
    catch(err){
        if(!(err instanceof CustomError)){
            err = new CustomError();
        }
        next(err);
    }
}

const authorizeRoles =  (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new CustomError('Access denied: You do not have the required role', 403));
        }
        next();
    }
}

module.exports = {authMiddleware, authorizeRoles};
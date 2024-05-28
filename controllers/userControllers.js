const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const CustomError = require('../errors/customErrors');  // {message, status}
const config = require('../config/config');

const allowedLocation = [
    'India', 'USA', 'Canada', 'Australia', 'Germany', 'China',
];

const registerUser = async(req,res, next)=>{
    try{
        const {username, firstName, lastName, location, email, password, role, isActive} = req.body;
        if(!username || !firstName || !lastName || !email || !password){
            throw new CustomError('Please enter all mandatory fields', 400);
        }
        if(!allowedLocation.includes(location)){
            throw new CustomError('Location not serviceable yet. Will be reaching soon at your area', 400);
        }
        const usernameExists = await User.findOne({username}); 
        const emailExists = await User.findOne({email}); 
        if(usernameExists){
            throw new CustomError('Username already in use. Please try something else', 400);
        }
        if(emailExists){
            throw new CustomError('Email already in use. Please try logging in or try resetting your password', 400);
        }
        const user = new User({
            username, 
            firstName, 
            lastName, 
            location, 
            email, 
            password, 
            role, 
            isActive
        });
        await user.save();
        return res.status(201).json({
            status: 'Success', 
            message: 'User created successfully'
        });
    }
    catch(err){
        if(!(err instanceof CustomError)){
            err = new CustomError(err.message, err.statusCode || 500);
        }
        next(err);
    }
};

const loginUser = async(req,res,next)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password){    
            throw new CustomError('Please enter email and password to login', 400);
        }   
        const user = await User.findOne({email});
        if(!user){
            throw new CustomError('Invalid email password combination. Please try again', 400);
        } 
        if(user.isActive === 0){
            throw new CustomError('Account disabled', 400);
        }
        const isMatchingPassword = await user.comparePassword(password);
        if(!isMatchingPassword){
            throw new CustomError('Invalid email password combination. Please try again', 400);
        }
        const token = await jwt.sign({id: user._id, role: user.role}, config.SECRET_ACCESS_TOKEN, {
            expiresIn: '1h'
        });
        return res.status(200).json({
            status: 'Success',
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });
    }
    catch(err){
        if(!(err instanceof CustomError)){
            err = new CustomError(err.message, err.statusCode || 500);
        }
        next(err);
    }
};

const getProfile = async(req,res,next)=>{
    try{
        if(!req.user){
            throw new CustomError('Invalid request', 400);
        }
        const userId = req.user.id;  // Assuming `id` is the key in the JWT payload
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomError('User not found', 404);
        }
        
        res.status(200).json({
            status: 'Success', 
            details: user 
        });
    }
    catch(err){
        if(!(err instanceof CustomError)){
            err = new CustomError(err.message, err.statusCode || 500);
        }
        next(err);
    }
};

const updateProfile = async(req,res,next)=>{
    try{
       const userId = req.user.id;
       const {firstName, lastName, location} = req.body;
       const updatedUser = await User.findByIdAndUpdate(userId, { firstName, lastName, location }, {new: true}) ;

       if (!updatedUser) {
        throw new CustomError('User not found', 404);
    }

       return res.status(200).json({
        status: 'Success',
        user: updatedUser
    });
    }
    catch(err){
        if(!(err instanceof CustomError)){
            err = new CustomError(err.message, err.statusCode || 500);
        }
        next(err);
    }
};

const updateRole = async(req, res, next) =>{
    try{
        const {newRole} = req.body.options;
        if (!newRole) {
            throw new CustomError('New role is required', 400);
        }
        const userId = req.user.id;
        const updatedUser = await User.findByIdAndUpdate(userId, {role: newRole});
        if(!updatedUser){
            throw new CustomError('User not found', 404);
        }
        return res.status(200).json({
            status: 'Success', 
            user: updatedUser
        });
    }
    catch(err){
        if(!(err instanceof CustomError)){
            err = new CustomError(err.message , err.statusCode || 500);
        }
        next(err);
    }
};

const modifyProfileStatus = async(req,res,next)=>{
    try{
        const userId = req.user.id;
        const {isActive} = req.body;
        
        const user = await User.findById(userId);
        if(!user){
            throw new CustomError('Inavlid user', 400);
        }
        if( typeof isActive != 'number' ||  (isActive!= 0 && isActive!= 1)){
            throw new CustomError('Invalid value passed while disabling or enabling', 400);
        }
        const result = await User.updateOne({_id: userId}, {isActive: isActive});
        if(result.nModified == 0){
            throw new CustomError('No value updated', 400);
        }
        const statusMessage = isActive === 1 ? `User ${user.username} enabled successfully` : `User ${user.username} disabled successfully` ;
        return res.status(200).json({
            status: 'Success', 
            message: statusMessage
        })
    }
    catch(err){
        if(!(err instanceof CustomError)){
            err = new CustomError(err.message, err.statusCode || 500);
        }
        next(err);
    }
};

const getUsers = async(req,res,next)=>{
    try{
        const usersProfileStatus = req.body.options;
        if(!usersProfileStatus){
            throw new CustomError('Invalid status', 400);
        }
        if(typeof usersProfileStatus != 'string' || (usersProfileStatus!= 'Active' && usersProfileStatus!= 'Inactive' && usersProfileStatus != 'All')){
            throw new CustomError('Invalid format of profile status', 400);
        }
        let users;
        if (usersProfileStatus === 'All'){
            users = await User.find();
        }
        else {
            const status = usersProfileStatus === 'Active' ? 1 : 0;
            users = await User.find({isActive: status});
        }
        return res.status(200).json({
            status: 'Success', 
            list: users
        })
    }
    catch(err){
        if(!(err instanceof CustomError)){
            err = new CustomError(err.message, err.statusCode || 500);
        }
        next(err);
    }
};

module.exports = {
    registerUser, loginUser, getProfile, updateProfile, updateRole, modifyProfileStatus, getUsers
};
const mongoose = require('mongoose');
const config = require('../config/config');

const connect = async()=>{
    try{
        await mongoose.connect(config.connectionString);
        console.log('Connected to MongoDB successfully');
    }
    catch(err){
        console.error('Failed to connect to MongoDB: ', err);
    }
};

module.exports = connect;
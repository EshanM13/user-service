
const errorHandler = async(err, req, res, next)=>{
    let message = err.message || 'Something went wrong';
    let statusCode = err.statusCode || 500;
    
    console.error(err);
    return res.status(statusCode).json({
        status: 'Failed',
        message: message,
    })
};

module.exports = errorHandler;
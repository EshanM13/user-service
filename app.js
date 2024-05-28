const express = require('express');
const app = express();
const config = require('./config/config');
const userRoutes = require('./routes/userRoutes');
const connect = require('./databases/connect');
const errorHandler = require('./errors/errors');

const PORT = config.PORT || 5302;
connect();

app.use('/api/users', userRoutes);

app.use(errorHandler);


app.listen(PORT, ()=>{
    console.log(`Listening on ${PORT}`);
});Z
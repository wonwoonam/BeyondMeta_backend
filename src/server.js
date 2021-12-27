const express = require('express');
const app = express();
const {userRouter, blogRouter} = require('./routes');
const mongoose = require('mongoose');
const {generateFakeData} = require('../faker2');




const server = async() => {

    try{
        const {MONGO_URI, PORT} = process.env

        if (!MONGO_URI) throw new Error ("MONGO_URI is required!!!");
        if (!PORT) throw new Error ("PORT is required!!!");

        await mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});
        //mongoose.set('debug', true)
        
        console.log("MongoDB connected");
        app.use(express.json());
    
        app.use('/user', userRouter);
        app.use('/blog', blogRouter);
        
        

        app.listen(PORT, async () =>  {
            console.log(`server listening on port ${PORT}`)
            // for (let i =0;i<20;i++){
            //     await generateFakeData(10,5,15 );
            // }
            
        });
            
    } catch(err){
        console.log(err);
    }
    
}

server();
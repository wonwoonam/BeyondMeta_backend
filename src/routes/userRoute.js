const {Router} = require('express');
const userRouter = Router();
const { User, Blog, Comment } = require('../models')
const mongoose = require('mongoose');

userRouter.get('/', async (req, res) => {
    try{
        const users = await User.find({});
        return res.send({users})
    }catch(err){
        console.log(err);
        return res.status(500).send({err: err.message})
    }
})

userRouter.get('/:userId', async(req, res)=>{
    
    try{
        const {userId} = req.params;
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({err:"invalid userid"});
        const user = await User.findOne({_id: userId});
        return res.send({user});

    }catch(err){
        console.log(err);
        return res.status(500).send({err: err.message});
    
    }
})

userRouter.post('/', async (req, res) => {
    try{
        let {username} = req.body;
        if(!username) return res.status(400).send({err: "username required"});

        const user = new User(req.body);
        await user.save();
        return res.send({user})
    }catch(err){
        console.log(err);
        return res.status(500).send({err:err.message})
    }
})

userRouter.delete('/:userId', async(req, res)=> {
    
    try{
        const {userId} = req.params;
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({err:"invalid userid"});
        const user = await Promise.all([
            User.findOneAndDelete({_id: userId}),
            Blog.deleteMany({"user._id": userId}),
            Blog.updateMany(
                {"comments.user": userId },
                {$pull: {comments: {user: userId}}}
            ),
            Comment.deleteMany({user:userId}),

        ])
        return res.send({user});

    }catch(err){
        console.log(err);
        return res.status(500).send({err: err.message});
    
    }
})

userRouter.put('/:userId', async(req, res)=>{
    try{
        const {userId} = req.params;
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({err:"invalid userid"});
        const {age, name} = req.body;
        if(!age && !name) return res.status(400).send({err:'age or name is required'});
        if (age && typeof age != 'number') return res.status(400).send({err:"age must be a number"});
        if (name && typeof name.first != 'string' && typeof name.last != 'string') return res.status(400).send({err:"first and last names are strings"});
        // let updateBody = {};
        // if(age) updateBody.age = age;
        // const user = await User.findByIdAndUpdate(userId,updateBody, {new: true});
        let user = await User.findById(userId);
        if(age) user.age = age;
        if(name) {
            user.name = name
            await Blog.updateMany({"user._id": userId}, {"user.name":name});

        }
        await user.save();  
        return res.send({user})
    }catch(err){
        console.log(err);
        return res.status(500).send({err: err.message});
    
    }
})

module.exports = {
    userRouter
}
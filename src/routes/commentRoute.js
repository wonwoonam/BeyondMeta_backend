const {Router} = require('express');
const { isValidObjectId, startSession } = require('mongoose');
const commentRouter = Router({mergeParams:true});
const {Blog, User, Comment} = require('../models');

commentRouter.post("/", async(req, res)=>{
    const session = await startSession();
    let comment;
    try{
        await session.withTransaction(async() => {
            const {blogId} = req.params;
            const {content, userId} = req.body;
            if(!isValidObjectId(blogId))
                return res.status(400).send({err: "blogId is invalid"});
            if(!isValidObjectId(userId))
                return res.status(400).send({err: "userId is invalid"});
            if (typeof content != "string")
                return res.status(400).send({err:"content is required"});

            const [blog, user] = await Promise.all([
                Blog.findById(blogId, {}, {session}),
                User.findById(userId, {}, {session})

            ]);

            if(!blog || !user)
                return res.status(400).send({err: "blog or user does not exist"});
            if(!blog.islive) return res.status(400).send({err:"blog is not available"})    
            comment = new Comment({content, user, userFullName: ` ${user.name.first} ${user.name.last}`,blog: blogId});
            //await session.abortTransaction()
            blog.commentsCount++;
            blog.comments.push(comment);
            if (blog.commentsCount > 3 ) blog.comments.shift();
            
            await Promise.all([comment.save({session}), blog.save()]);
            

        });
        return  res.send({comment})
        
    }catch(err){
        return res.status(400).send({err: err.message});
    }finally{
        await session.endSession()
    }
});

commentRouter.get("/", async(req, res)=> {
    let {page=0} =req.query;
    page = parseInt(page);
    const {blogId} = req.params;
    if(!isValidObjectId(blogId))
        return res.status(400).send({err:"blogid is invalid"});

    const comments = await Comment.find({blog: blogId}).sort({createdAt: -1}).skip(page*3).limit(3);
    return res.send({comments});
});

commentRouter.patch("/:commentId", async(req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;
    if(typeof content !== "string")
        return res.status(400).send({err: "content is required"});

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId},
        {content},
        {new: true}
    );
    return res.send({comment});
});

commentRouter.delete("/:commentId", async (req, res) => {
    const {commentId} = req.params;
    const comment = await Comment.findOneAndDelete({ _id: commentId});
    await Blog.updateOne(
        {"comments._id": commentId},
        {$pull: {comments: {_id: commentId}}}
    );
    return res.send({comment});
});
module.exports = {commentRouter};
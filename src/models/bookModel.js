const mongoose = require('mongoose')
// const ISBN = require('isbn-verify')
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({

    
        title:{
            type     : String,
            required : [true, "title must be provided"],
            unique   : [true, "title already exist"],
            trim     : true        
        },
        excerpt:{
            type     : String,
            required : [true, "excerpt must be provided"],
            trim     : true 
        }, 
        userId:{
            type     : ObjectId,
            required : [true, "userId must be provided"],
            ref      : "User",
            trim     : true 
        },
        ISBN:{
            type     : String,
            required : [true, "ISBN must be provided"],
            unique   : [true, "ISBN already exist"],
            // validate : [ISBN.Verify(ISBN), "invalid ISBN number"],
            trim     : true 
        },
        category:{
            type     : String,
            required : [true, "category must be provided"],
            trim     : true
        },
        subcategory:{
            type     : String,
            required : [true, "subcategory must be provided"],
            trim     : true
        },
        reviews:{
            type     : Number,
            default  : 0
        },
        deletedAt:{
            type     : Date
        }, 
        isDeleted:{
            type     : Boolean,
            default  : false
        },
        releasedAt:{
            type     : Date,
            required : [true, "book releasing Date must be provided"],    //format("YYYY-MM-DD"),
            trim     : true 
        }  

}, {timestamps: true})

module.exports = mongoose.model("Book", bookSchema)
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({

    
    bookId:{
        type     : ObjectId,
        required : [true, "bookId must be provided"],
        ref      : "Book",
        trim     : true 
    },
    reviewedBy:{
        type     : String,
        required : [true, "reviewed by must be provided"],
        default  : "Guest",
        trim     : true 
    },
    reviewedAt:{
        type     : Date,
        required : [true, "book reviewing Date must be provided"],    //format("YYYY-MM-DD"),
        trim     : true 
    },
    rating:{
        type     : Number,
        required : [true, "book ratings must be provided"],    
        trim     : true,
        min      : 1,
        max      : 5 
    },
    review:{
        type     : String,
        trim     : true  
    },
    isDeleted:{
        type     : Boolean,
        default  : false
    }    

}, {timestamps : true})

module.exports = mongoose.model("Review", reviewSchema)
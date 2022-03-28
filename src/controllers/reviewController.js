const ReviewModel = require('../models/reviewModel')
const BookModel = require('../models/bookModel')
const mongoose = require('mongoose')


const isValid = function(value){
    if(typeof (value) == 'undefined' || value == null) return false
    if(typeof (value) == 'string' && value.trim().length == 0) return false
    if(typeof (value) == 'number') return false
    return true
}

const isValidRating = function(value){
    if (typeof (value) == 'undefined' || value == null) return false
    if ( typeof (value) != 'number') return false
    if (value < 1 && value > 5) return false
    return true
}

const isValidRequestBody = function(object){
return (Object.keys(object).length > 0)
}

const isValidIdType = function(objectId){
return mongoose.Types.ObjectId.isValid(objectId)
}

const newReview = async function(req, res){
    try{
        const requestBody = req.body 
        const queryParams = req.query
        const bookId = req.params.bookId

            if(isValidRequestBody(queryParams)){
            return  res.status(400).send({status: false, message : "invalid endpoint"})
            }

            if(!isValidRequestBody(requestBody)){
            return  res.status(400).send({status : false, message : "review data is required to create a new review"})
            }
            
            if(!bookId){
            return res.status(400).send({status : false, message : "bookId is required in path params"})
            }   

            if(!isValidIdType(bookId)){
            return  res.status(400).send({status : false, message : `enter a valid bookId`})
            }

        const bookById = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null})

            if(!bookById){
            return res.status(404).send({status : false, message : "Book does not exist"})
            }

        const {reviewedBy, rating, review} = requestBody

        if (requestBody.hasOwnProperty(reviewedBy)){
            if(isValid(reviewedBy)){
                requestBody["reviewedBy"] = reviewedBy.trim()

            }else{
                res.status(400).send({status : false, message : "enter a valid name"})
            }

        }else{
            requestBody["reviewedBy"] = "Guest"
        }
       

        if(!isValidRating(rating)){
        return res.status(400).send({status : false, message : "rating must be provided in Number format: 1 < Rating < 5  "})
        }
      
        if(requestBody.hasOwnProperty("review")){

            if(typeof (review) === "string" && review.trim().length > 0){

                requestBody.bookId = bookId
                requestBody.isDeleted = false 
                requestBody.reviewedAt = Date.now()     

                const createReview = await ReviewModel.create(requestBody)

                const updateReviewCount = await BookModel.findOneAndUpdate({_id: bookId, isDeleted : false},  {$inc : {reviews : +1}}, {new : true})

                res.status(201).send({status : true, message: "review added successfully", data: createReview})

            }else{
                res.status(400).send({status : false, message : "please enter a review in valid format"})
            }
        }
       

    }catch(err){
        res.status(500).send({error : err.message})
    }
}

module.exports.newReview = newReview
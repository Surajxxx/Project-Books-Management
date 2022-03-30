const ReviewModel = require('../models/reviewModel')
const BookModel = require('../models/bookModel')
const mongoose = require('mongoose')

// validation functions
const isValid = function(value){
    if(typeof (value) == 'undefined' || value == null) return false
    if(typeof (value) == 'string' && value.trim().length == 0) return false
    if(typeof (value) == 'number') return false
    if(typeof (value) == 'object') return false
    return true
}

const isValidRating = function(value){
    if (typeof (value) == 'undefined' || value == null) return false
    if ( typeof (value) != 'number') return false
    return true
}

const isValidRequestBody = function(object){
return (Object.keys(object).length > 0)
}

const isValidIdType = function(objectId){
return mongoose.Types.ObjectId.isValid(objectId)
}

// handler for creating new Review
const newReview = async function(req, res){
    try{
        const requestBody = req.body 
        const queryParams = req.query
        const bookId = req.params.bookId

            //query params must be empty
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
           
        const bookByBookId = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null})

            if(!bookByBookId){
            return res.status(404).send({status : false, message :` No Book found by ${bookId}`})
            }
        // using destructuring then checking existence of property. If exist then validating that key     
        const {reviewedBy, rating, review} = requestBody

        // creating an object to add validated keys from requestBody    
        const reviewData = {}

        if (requestBody.hasOwnProperty("reviewedBy")){
            if(isValid(reviewedBy)){
                reviewData["reviewedBy"] = reviewedBy.trim()

            }else{
            return  res.status(400).send({status : false, message : "enter name in valid format like: JOHN"})
            }
        
        // if requestBody does not have the "reviewedBy" then assigning its default value 
        }else{
               reviewData["reviewedBy"] = "Guest"
        }
       
        if(isValidRating(rating)){

            if(rating < 1 || rating > 5){
            return res.status(400).send({status : false, message : "rating should be between : 1 to 5  "})
            }

            reviewData["rating"] = rating
        
        }else{
            return res.status(400).send({status : false, message : "rating must be provided in Number format"})
        }
           
       
        if(requestBody.hasOwnProperty("review")){

            if(typeof (review) === "string" && review.trim().length > 0){
               
                reviewData["review"] = review.trim()
               
            }else{
            return   res.status(400).send({status : false, message : `enter review in valid format like : "awesome book must read" `})
            }
        }

        // adding properties like: bookId, default value of isDeleted and review creation date & time inside reviewData
        reviewData.bookId = bookId
        reviewData.isDeleted = false 
        reviewData.reviewedAt = Date.now()     

        const createReview = await ReviewModel.create(reviewData)

        const updateReviewCountInBook = await BookModel.findOneAndUpdate({_id: bookId, isDeleted : false, deletedAt : null},  {$inc : {reviews : +1}}, {new : true})

        const allReviewsOfThisBook = await ReviewModel.find({bookId: bookId, isDeleted : false})

        // USING .lean() to convert mongoose object to plain js object for adding a property temporarily     
        const book = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null}).lean()

        // temporarily adding one new property inside book which consist all reviews of this book
        book.reviewsData = allReviewsOfThisBook

        res.status(201).send({status : true, message: "review added successfully", data: book})
       
    }catch(err){
        res.status(500).send({error : err.message})
    }
}

const updateReview = async function (req, res){
    try{
        const queryParams = req.query
        const requestBody = req.body
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId

        // query params must be empty
        if(isValidRequestBody(queryParams)){
        return  res.status(400).send({status: false, message : "invalid endpoint"})
        }
        // request body must be empty
        if(!isValidRequestBody(requestBody)){
        return  res.status(400).send({status : false, message : "data is required for review update"})
        }
        
        if(!bookId){
        return res.status(400).send({status : false, message : "bookId is required in path params"})
        }   

        if(!isValidIdType(bookId)){
        return  res.status(400).send({status : false, message : `enter a valid bookId`})
        }

        // using .lean() to convert mongoose object to plain js object for adding a property temporarily 
        const bookByBookId = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null}).lean()

        if(!bookByBookId){
        return res.status(404).send({status : false, message : ` No Book found by ${bookId}`})
        }

        if(!reviewId){
        return res.status(400).send({status : false, message : "reviewId is required in path params"})
        }   
    
        if(!isValidIdType(reviewId)){
        return  res.status(400).send({status : false, message : `enter a valid reviewId`})
        }

        const reviewByReviewId = await ReviewModel.findOne({_id : reviewId, isDeleted : false})

        if(!reviewByReviewId){
        return res.status(404).send({status : false, message : `No review found by ${reviewId} `})
        }

        if(reviewByReviewId.bookId != bookId){
        return res.status(404).send({status : false, message : "review is not from this book"})  
        }
    
        const {review, reviewedBy, rating} = requestBody

        // creating an empty object for adding all updates as per requestBody
        const update = {}

        // if requestBody has the mentioned property then validating that property and adding it to updates object
        if (requestBody.hasOwnProperty("reviewedBy")){
            if(!isValid(reviewedBy)){
            return res.status(400).send({status : false, message : `enter a valid name like: "JOHN" `})
            }

            update["reviewedBy"] = reviewedBy.trim()

        }

        if(requestBody.hasOwnProperty("rating")){
            if(!isValidRating(rating)){
            return res.status(400).send({status : false, message : "rating must be provided in Number format"})
            }

            if(rating < 1 && rating > 5){
            return res.status(400).send({status : false, message : "rating should be : 1 < Rating < 5  "})
            }

                update["rating"] = rating            
        }

        if(requestBody.hasOwnProperty("review")){
            if(typeof (review) === "string" && review.trim().length > 0){

               update['review'] = review.trim()

            }else{
             return  res.status(400).send({status : false, message : `enter review in valid format like : "awesome book must read" `})
            }
        }
        
        const reviewUpdate = await ReviewModel.findOneAndUpdate({_id : reviewId, isDeleted : false}, {$set : update}, {new : true})

        const allReviewsOfThisBook = await ReviewModel.find({bookId : bookId, isDeleted : false})

        // adding a temporary property inside book which consist all reviews of this book 
        bookByBookId.reviewsData = allReviewsOfThisBook

        res.status(200).send({status : true, message : "review updated successfully", data : bookByBookId})

    }catch(err){
        res.status(500).send({error : err.message})
    }
}

const deleteReview = async function(req, res){
    try{
        const queryParams = req.query
        const requestBody = req.body
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId

        if(isValidRequestBody(queryParams)){
        return  res.status(400).send({status: false, message : "invalid endpoint"})
        }

        if(isValidRequestBody(requestBody)){
        return  res.status(400).send({status : false, message : "data is not required in request body"})
        }
        
        if(!bookId){
        return res.status(400).send({status : false, message : "bookId is required in path params"})
        }   

        if(!isValidIdType(bookId)){
        return  res.status(400).send({status : false, message : `enter a valid bookId`})
        }

        const bookByBookId = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null})

        if(!bookByBookId){
        return res.status(404).send({status : false, message : `No book found by ${bookId} `})
        }

        if(!reviewId){
        return res.status(400).send({status : false, message : "reviewId is required in path params"})
        }   
    
        if(!isValidIdType(reviewId)){
        return  res.status(400).send({status : false, message : `enter a valid reviewId`})
        }

        const reviewByReviewId = await ReviewModel.findOne({_id : reviewId, isDeleted : false})

        if(!reviewByReviewId){
        return res.status(404).send({status : false, message : `no review found by ${reviewId}`})
        }

        if(reviewByReviewId.bookId != bookId){
        return res.status(404).send({status : false, message : "review is not from this book"})  
        }

        const markDirtyReview = await ReviewModel.findByIdAndUpdate(reviewId, {$set : {isDeleted : true}}, {new : true})

        const updateReviewCountInBook = await BookModel.findByIdAndUpdate(bookId, {$inc : {reviews : -1}}, {new : true})

        res.status(200).send({status: true, message : "review has been successfully deleted"})

    }catch(err){
        res.status(500).send({error : err.message})
    }
}

module.exports.newReview = newReview
module.exports.updateReview = updateReview
module.exports.deleteReview = deleteReview
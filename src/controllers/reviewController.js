const ReviewModel = require('../models/reviewModel')
const BookModel = require('../models/bookModel')
const mongoose = require('mongoose')


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
            return res.status(404).send({status : false, message :` No Book found by ${bookId}`})
            }

        const {reviewedBy, rating, review} = requestBody

        if (requestBody.hasOwnProperty("reviewedBy")){
            if(isValid(reviewedBy)){
                requestBody["reviewedBy"] = reviewedBy.trim()

            }else{
            return  res.status(400).send({status : false, message : "enter name in valid format like: JOHN"})
            }

        }else{
            requestBody["reviewedBy"] = "Guest"
        }
       

        if(!isValidRating(rating)){
        return res.status(400).send({status : false, message : "rating must be provided in Number format "})
        }
        
        if(rating > 1 && rating < 5){
        return res.status(400).send({status : false, message : "rating should be : 1 < Rating < 5  "})
        }
       
     
      
        if(requestBody.hasOwnProperty("review")){

            if(typeof (review) === "string" && review.trim().length > 0){

                requestBody.bookId = bookId
                requestBody.isDeleted = false 
                requestBody.reviewedAt = Date.now()     

                const createReview = await ReviewModel.create(requestBody)

                const updateReviewCount = await BookModel.findOneAndUpdate({_id: bookId, isDeleted : false, deletedAt : null},  {$inc : {reviews : +1}}, {new : true})

                res.status(201).send({status : true, message: "review added successfully", data: createReview})

            }else{
            return   res.status(400).send({status : false, message : `enter review in valid format like : "awesome book must read" `})
            }
        }
       
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

        if(isValidRequestBody(queryParams)){
        return  res.status(400).send({status: false, message : "invalid endpoint"})
        }

        if(!isValidRequestBody(requestBody)){
        return  res.status(400).send({status : false, message : "data is required for review update"})
        }
        
        if(!bookId){
        return res.status(400).send({status : false, message : "bookId is required in path params"})
        }   

        if(!isValidIdType(bookId)){
        return  res.status(400).send({status : false, message : `enter a valid bookId`})
        }

        const bookById = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null})

        if(!bookById){
        return res.status(404).send({status : false, message : ` No Book found by ${bookId}`})
        }

        if(!reviewId){
        return res.status(400).send({status : false, message : "reviewId is required in path params"})
        }   
    
        if(!isValidIdType(reviewId)){
        return  res.status(400).send({status : false, message : `enter a valid reviewId`})
        }

        const reviewById = await ReviewModel.findOne({_id : reviewId, isDeleted : false})

        if(!reviewById){
        return res.status(404).send({status : false, message : `No review found by ${reviewId} `})
        }

        if(reviewById.bookId != bookId){
        return res.status(404).send({status : false, message : "review is not from this book"})  
        }

        const {review, reviewedBy, rating} = requestBody

        const update = {}

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

            if(rating > 1 && rating < 5){
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
        console.log(update)
        const reviewUpdate = await ReviewModel.findOneAndUpdate({_id : reviewId, isDeleted : false}, {$set : update}, {new : true})

        res.status(200).send({status : true, message : "review updated successfully", data : reviewUpdate})

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

        const bookById = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null})

        if(!bookById){
        return res.status(404).send({status : false, message : `No book found by ${bookId} `})
        }

        if(!reviewId){
        return res.status(400).send({status : false, message : "reviewId is required in path params"})
        }   
    
        if(!isValidIdType(reviewId)){
        return  res.status(400).send({status : false, message : `enter a valid reviewId`})
        }

        const reviewById = await ReviewModel.findOne({_id : reviewId, isDeleted : false})

        if(!reviewById){
        return res.status(404).send({status : false, message : `no review found by ${reviewId}`})
        }

        if(reviewById.bookId != bookId){
        return res.status(404).send({status : false, message : "review is not from this book"})  
        }

        const markDirtyReview = await ReviewModel.findByIdAndUpdate(reviewId, {$set : {isDeleted : true}}, {new : true})

        const updateReviewCount = await BookModel.findByIdAndUpdate(bookId, {$inc : {reviews : -1}})

        res.status(200).send({status: true, message : "review has been successfully deleted"})


    }catch(err){
        res.status(500).send({error : err.message})
    }
}

module.exports.newReview = newReview
module.exports.updateReview = updateReview
module.exports.deleteReview = deleteReview
const BookModel = require('../models/bookModel')
const UserModel = require('../models/userModel')
const { default: mongoose } = require('mongoose')
const moment  = require('moment')
const ReviewModel = require('../models/reviewModel')


// validation functions 
    const isValid = function(value){
        if(typeof (value) == 'undefined' || value == null) return false
        if(typeof (value) == 'string' && value.trim().length == 0) return false
        if(typeof (value) == 'number') return false
        if(typeof (value) == 'object') return false
        return true
    }

    const isValidRequestBody = function(object){
    return (Object.keys(object).length > 0)
    }

    const isValidIdType = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
    }

    const isValidSubcategory = function(value){
        if(typeof (value) == 'undefined' || value == null) return false
        if(typeof (value) == 'string' && value.trim().length == 0) return false
        if(typeof (value) == 'number') return false
        return true
    }  

// handler function for new book entry    
const registerBook = async function (req, res){
    try{
        const requestBody = req.body 
        const queryParams = req.query
        const decodedToken = req.decodedToken
        
        //  query params must be empty
            if(isValidRequestBody(queryParams)){
            return  res.status(400).send({status: false, message : "invalid endpoint"})
            }

            if(!isValidRequestBody(requestBody)){
            return  res.status(400).send({status : false, message : "Book data is required to create a new user"})
            }   
        // using destructuring then validating each property
        const {title, excerpt, userId, ISBN, category, subcategory, releasedAt} = requestBody

            if(!isValid(title)){
            return  res.status(400).send({status : false, message : `title is required and should be in valid format like: "Atomic habits"`})
            }
        
        // title must be unique    
        const isTitleUnique = await BookModel.findOne({title : title, isDeleted : false, deletedAt : null})

            if(isTitleUnique){
            return  res.status(400).send({status : false, message : `title already exist`})
            }

            if(!isValid(excerpt)){
            return  res.status(400).send({status : false, message : `excerpt is required and should be in valid format`})
            }

            if(!isValid(userId)){
            return  res.status(400).send({status : false, message : `userId is required and should be in valid format`})
            }

            if(!isValidIdType(userId)){
            return  res.status(400).send({status : false, message : `enter a valid userId`})
            }

        // finding user with the given id    
        const isUserExistWithID = await UserModel.findById(userId)    

            if(!isUserExistWithID){
            return  res.status(404).send({status : false, message : `no user exist with ${userId} `})
            }

          // authorization checking
            if((decodedToken.userId != userId)){
            return res.status(403).send({status : false, message : `unauthorized access`})
            }

          // token expiry checking
            if((Date.now() > (decodedToken.exp * 1000))){
            return res.status(403).send({status : false, message : `session expired, please login again`})
            } 

            if(!isValid(ISBN)){
            return  res.status(400).send({status : false, message : `ISBN is required`})
            }
            // checking ISBN format
            if(!/^(97(8|9))?\d{9}(\d|X)$/.test(ISBN.split("-").join(""))){
            return  res.status(400).send({status : false, message : `enter a valid ISBN of 13 digits`})    
            }

        // ISBN should be unique    
        const isUniqueISBN = await BookModel.findOne({ISBN : ISBN, isDeleted : false, deletedAt : null})    

            if(isUniqueISBN){
            return  res.status(400).send({status : false, message : `ISBN already exist`})
            }

            if(!isValid(category)){
            return  res.status(400).send({status : false, message : `category is required and should be in valid format like: "Fiction"`})
            }

            // if subcategory is an array then validating each element
            if(Array.isArray(subcategory)){

                for(let i= 0; i<subcategory.length; i++){
                    element = subcategory[i]
                    if(!isValid(element)){
                    return  res.status(400).send({status : false, message : `subcategory is required and should be in valid format like: ["Romantic", "cool"] `})
                    }
                }

            }
            // if subcategory is not an array then validating that 
            if(!isValidSubcategory(subcategory)){
            return  res.status(400).send({status : false, message : `subcategory is required and should be in valid format like: "Romantic" `})
            }

            if(!isValid(releasedAt)){
            return  res.status(400).send({status : false, message : `releasedAt is required`})
            }
            
            // checking date format 
            if(!/^[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}/.test(releasedAt)){
            return  res.status(400).send({status : false, message : `released date format should be YYYY-MM-DD`})
            }
            
            // validating the date
            if(moment(releasedAt).isValid() == false){
            return res.status(400).send({status : false, message : "enter a valid released date"})    
            }
              

        // adding validated keys from requestBody and adding default values of isDeleted, reviews and deletedAt    
        const bookData = {title, excerpt, userId, ISBN, category, subcategory, releasedAt, isDeleted: false, reviews: 0, deletedAt : null}

        const newBook = await BookModel.create(bookData)

        res.status(201).send({status: true, message: "new book added successfully", data : newBook })

    }catch(err){       
        res.status(500).send({error : err.message})
    }
}


const booksList = async function(req, res){
    try{
        
        const requestBody = req.body
        const queryParams = req.query
        const filterConditions = {isDeleted : false, deletedAt : null}

            if(isValidRequestBody(requestBody)){
            return  res.status(400).send({status : false, message : "data is not required in body"})
            } 
    // if filters are provided then validating each filter then adding it to filterCondition object   
      if(isValidRequestBody(queryParams)){

            const {userId, category, subcategory} = queryParams

            if(isValid(userId) && isValidIdType(userId)){   

            const userById = await UserModel.findById(userId)   

                if(userById){
                    filterConditions['userId'] = userId
                }
            }
            
            if(isValid(category)){
                filterConditions['category'] = category.trim()               
            }

            if(isValid(subcategory)){
                filterConditions['subcategory'] = subcategory.trim()               
            }
           
            const bookListAfterFiltration = await BookModel.find(filterConditions).select({_id : 1, title: 1, excerpt : 1, userId : 1, category : 1, subcategory :1, releasedAt : 1, reviews : 1 }).sort({title : 1})

                if(bookListAfterFiltration.length == 0){
                return  res.status(404).send({status : false, message : "no books found"})
                }
       
                res.status(200).send({status : true, message : "filtered Book list is here", booksCount: bookListAfterFiltration.length, bookList : bookListAfterFiltration })
    
    // if filters are not provided
    }else{
            const bookList = await BookModel.find(filterConditions).select({_id : 1, title: 1, excerpt : 1, userId : 1, category : 1,subcategory :1, releasedAt : 1, reviews : 1 }).sort({title : 1})

                if(bookList.length == 0){
                return res.status(404).send({status : false, message : "no books found"})
                }

            res.status(200).send({status : true, message : "Book list is here", booksCount: bookList.length ,bookList : bookList})
      } 

    }catch(err){
        res.status(500).send({error : err.message})
    }
}


const getBookDetails = async function(req, res){
    try{
        const queryParam = req.query
        const requestBody = req.body
        const bookId = req.params.bookId

        if(isValidRequestBody(requestBody)){
        return  res.status(400).send({status : false, message : "data is not required in body"})
        } 

        if(isValidRequestBody(queryParam)){
        return  res.status(400).send({status : false, message : "invalid endpoint"})
        } 

        if(!bookId){
        return res.status(400).send({status : false, message : "bookId is required in path params"})
        }   

        if(!isValidIdType(bookId)){
        return  res.status(400).send({status : false, message : `enter a valid bookId`})
        }
        // used .lean to  convert mongoose object to plain javaScript object
        const bookByBookId = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null}).lean()

        if(!bookByBookId){
        return res.status(404).send({status : false, message : `no book found by ${bookId}`})
        }

        
        const allReviewsOfThisBook = await ReviewModel.find({bookId : bookId, isDeleted : false})

        // adding a new property inside book and assigning it to allReviews array 
        bookByBookId.reviewsData = allReviewsOfThisBook

        res.status(200).send({status : true, message : "Book details", data : bookByBookId })
    
    }catch(err){
        res.status(500).send({error : err.message})
    }
}

const updateBooks = async function(req, res){
    try{
        const requestBody = req.body
        const queryParam = req.query
        const bookId = req.params.bookId
        

        // query params should be empty
        if(isValidRequestBody(queryParam)){
        return  res.status(400).send({status : false, message : "invalid endpoint"})
        }

        if(!isValidRequestBody(requestBody)){
        return  res.status(400).send({status : false, message : "input data is required for update"})
        } 

        if(!bookId){
        return res.status(400).send({status : false, message : "bookId is required in path params"})
        }   
    
        if(!isValidIdType(bookId)){
        return  res.status(400).send({status : false, message : `enter a valid bookId`})
        }
    
        const bookByBookId = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null})
    
        if(!bookByBookId){
        return res.status(404).send({status : false, message : `no book found by ${bookId}`})
        }

        // using destructuring 
        const {title, excerpt, releasedAt, ISBN} = requestBody

        // creating an empty object for adding all updates as per requestBody
        const updates = {}

        // if requestBody has the mentioned property then validating that property and adding it to updates object
        if(requestBody.hasOwnProperty("title")){

            if(isValid(title)){

                const isTitleUnique = await BookModel.findOne({title : title.trim(), isDeleted : false, deletedAt : null})

                if(isTitleUnique){
                return  res.status(400).send({status : false, message : " Book title already exist. It should be unique "})
                }

                updates["title"] = title.trim()

            }else{
                return res.status(400).send({status : false, message : `enter book title in valid format like : "Atomic habits"`})
            }

        }
        
        if(requestBody.hasOwnProperty("excerpt")){ 
            if(isValid(excerpt)){

                updates["excerpt"] = excerpt.trim()

            }else{
                return   res.status(400).send({status : false, message : "enter book excerpt in valid format"})
            }
        }        

        if(requestBody.hasOwnProperty("releasedAt")){

            if(isValid(releasedAt)){
                if(!/^[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}/.test(releasedAt)){
                return  res.status(400).send({status : false, message : `released date format should be YYYY-MM-DD`})
                }
            
                if(moment(releasedAt).isValid() == false){
                return res.status(400).send({status : false, message : "enter a valid released date"})    
                }

                updates["releasedAt"] = releasedAt

            }else{
                    return res.status(400).send({status : false, message : "enter released date in valid format YYYY-MM-DD"})   
            }
        }

        if(requestBody.hasOwnProperty("ISBN")){

            if(isValid(ISBN)){

                if(!/^(97(8|9))?\d{9}(\d|X)$/.test(ISBN.split("-").join(""))){
                return  res.status(400).send({status : false, message : `enter a valid ISBN of 13 digits`})    
                }
        
                const isUniqueISBN = await BookModel.findOne({ISBN : ISBN, isDeleted : false, deletedAt : null})    
        
                    if(isUniqueISBN){
                    return  res.status(400).send({status : false, message : `ISBN already exist`})
                    }

                updates["ISBN"] = ISBN.trim()

            }else{
                return res.status(400).send({status : false, message : "use proper format for ISBN"})
            }
        }    
        // updating book by the content inside updates object
        const updatedBookDetails = await BookModel.findOneAndUpdate({_id: bookId, isDeleted : false, deletedAt : null}, {$set : updates}, {new : true})

        res.status(200).send({status: true, message : "book details update successfully", data: updatedBookDetails})

    }catch(err){
        res.status(500).send({error : err.message})
    }
}

const deleteBook = async function(req, res){
    try{
        const queryParam = req.query
        const requestBody = req.body
        const bookId = req.params.bookId

            // query params should be empty
            if(isValidRequestBody(queryParam)){
            return  res.status(400).send({status : false, message : "invalid endpoint"})
            }

            if(isValidRequestBody(requestBody)){
            return  res.status(400).send({status : false, message : "input data is not required in request body"})
            } 

            if(!bookId){
            return res.status(400).send({status : false, message : "bookId is required in path params"})
            }   
        
            if(!isValidIdType(bookId)){
            return  res.status(400).send({status : false, message : `enter a valid bookId`})
            }
        
            const bookByBookId = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null})
        
            if(!bookByBookId){
            return res.status(404).send({status : false, message : `no book found by ${bookId}`})
            }

            const markDirtyBook = await BookModel.findByIdAndUpdate(bookId, {$set : {isDeleted : true, deletedAt : Date.now() }}, {new : true})

            const markDirtyAllReviewsOfThisBook = await ReviewModel.updateMany({bookId : bookId, isDeleted: false}, {$set : {isDeleted : true }}, {new : true})

            res.status(200).send({status : true, message : "book deleted successfully"})
            
    }catch(err){
        res.status(500).send({error : err.message})
    }
}

module.exports.registerBook = registerBook
module.exports.booksList = booksList
module.exports.getBookDetails = getBookDetails
module.exports.updateBooks = updateBooks
module.exports.deleteBook = deleteBook
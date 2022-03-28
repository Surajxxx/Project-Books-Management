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
        return true
    }

    const isValidRequestBody = function(object){
    return (Object.keys(object).length > 0)
    }

    const isValidIdType = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
    }

      

// handler function for new book entry    
const registerBook = async function (req, res){
    try{
        const requestBody = req.body 
        const queryParams = req.query

        
            if(isValidRequestBody(queryParams)){
            return  res.status(400).send({status: false, message : "invalid endpoint"})
            }

            if(!isValidRequestBody(requestBody)){
            return  res.status(400).send({status : false, message : "Book data is required to create a new user"})
            }   

        const {title, excerpt, userId, ISBN, category, subcategory, releasedAt} = requestBody

            if(!isValid(title)){
            return  res.status(400).send({status : false, message : `title is required`})
            }

        const isTitleUnique = await BookModel.findOne({title : title, isDeleted : false, deletedAt : null})

            if(isTitleUnique){
            return  res.status(400).send({status : false, message : `title already exist`})
            }

            if(!isValid(excerpt)){
            return  res.status(400).send({status : false, message : `excerpt is required`})
            }

            if(!isValid(userId)){
            return  res.status(400).send({status : false, message : `userId is required`})
            }

            if(!isValidIdType(userId)){
            return  res.status(400).send({status : false, message : `enter a valid userId`})
            }

        const isUserExistWithID = await UserModel.findById(userId)    

            if(!isUserExistWithID){
            return  res.status(400).send({status : false, message : "no user exist with this ID"})
            }

            if(!isValid(ISBN)){
            return  res.status(400).send({status : false, message : `ISBN is required`})
            }

            if(!/((978[\--– ])?[0-9][0-9\--– ]{10}[\--– ][0-9xX])|((978)?[0-9]{9}[0-9Xx])/.test(ISBN)){
            return  res.status(400).send({status : false, message : `enter a valid format of ISBN`})    
            }


        const isUniqueISBN = await BookModel.findOne({ISBN : ISBN, isDeleted : false, deletedAt : null})    

            if(isUniqueISBN){
            return  res.status(400).send({status : false, message : `ISBN already exist`})
            }

            if(!isValid(category)){
            return  res.status(400).send({status : false, message : `category is required`})
            }

            if(!isValid(subcategory)){
            return  res.status(400).send({status : false, message : `subcategory is required`})
            }

            if(!isValid(releasedAt)){
            return  res.status(400).send({status : false, message : `releasedAt is required`})
            }
            
            if(!/^[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}/.test(releasedAt)){
            return  res.status(400).send({status : false, message : `released date format should be YYYY-MM-DD`})
            }
            
            if(moment(releasedAt).isValid() == false){
            return res.status(400).send({status : false, message : "enter a valid released date"})    
            }

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
        const filterConditions = {isDeleted : false}

            if(isValidRequestBody(requestBody)){
            return  res.status(400).send({status : false, message : "data is not required in body"})
            } 
            
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
           
            const bookListAfterFiltration = await BookModel.find(filterConditions).select({_id : 1, title: 1, excerpt : 1, userId : 1, category : 1, releasedAt : 1, reviews : 1 }).sort({title : 1})

                if(bookListAfterFiltration.length == 0){
                return  res.status(404).send({status : false, message : "no books found"})
                }

            res.status(200).send({status : true, message : "filtered Book list is here", bookList : bookListAfterFiltration })

      }else{
            const bookList = await BookModel.find(filterConditions).select({_id : 1, title: 1, excerpt : 1, userId : 1, category : 1, releasedAt : 1, reviews : 1 }).sort({title : 1})

                if(bookList.length == 0){
                return res.status(404).send({status : false, message : "no books found"})
                }

            res.status(200).send({status : true, message : "Book list is here", bookList : bookList})
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

        const bookById = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null}).lean()

        if(!bookById){
        return res.status(404).send({status : false, message : "no book found by this ID"})
        }
   
        const allReviews = await ReviewModel.find({bookId : bookId, isDeleted : false})
        
        bookById.reviewsData = allReviews

        res.status(200).send({status : true, message : "Book details", data : bookById })
    

    }catch(err){
        res.status(500).send({error : err.message})
    }
}

const updateBooks = async function(req, res){
    try{
        const requestBody = req.body
        const queryParam = req.query
        const bookId = req.params.bookId
        

       
            if(isValidRequestBody(queryParam)){
            return  res.status(400).send({status : false, message : "invalid point"})
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
        
            const bookById = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null})
        
            if(!bookById){
            return res.status(404).send({status : false, message : "no book found by this ID"})
            }

            const {title, excerpt, releasedAt, ISBN} = requestBody

            const updates = {}

            if(requestBody.hasOwnProperty("title")){

                if(isValid(title)){

                    const isTitleUnique = await BookModel.findOne({title : title.trim(), isDeleted : false, deletedAt : null})
    
                    if(isTitleUnique){
                    return  res.status(400).send({status : false, message : " Book title already exist. It should be unique "})
                    }
    
                    updates["title"] = title.trim()
    
                }else{
                    return res.status(400).send({status : false, message : "enter book title in valid format"})
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

                    if(!/((978[\--– ])?[0-9][0-9\--– ]{10}[\--– ][0-9xX])|((978)?[0-9]{9}[0-9Xx])/.test(ISBN)){
                        return  res.status(400).send({status : false, message : `enter a valid format of ISBN`})    
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
        
            const bookById = await BookModel.findOne({_id : bookId, isDeleted : false, deletedAt : null})
        
            if(!bookById){
            return res.status(404).send({status : false, message : "no book found by this ID"})
            }

            const markDirty = await BookModel.findByIdAndUpdate(bookId, {$set : {isDeleted : true, deletedAt : Date.now() }}, {new : true})

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
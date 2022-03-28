const mongoose = require('mongoose')

const validPhone = function(phone){
    const regexForMobile = /^[6-9]\d{9}$/
    return regexForMobile.test(phone)
}

const validEmail = function(email){
    const regexForEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return regexForEmail.test(email)
}

const userSchema = new mongoose.Schema({

    title :{
        type     : String,
        required : [ true, `title must be provided from these values: ["Mr", "Mrs", "Miss"]`],
        enum     : ["Mr", "Mrs", "Miss"],
        trim     : true
    },
    name :{
        type     : String,
        required : [true, "User name must be provided"],
        trim     : true
    },
    phone :{
        type     : String,
        required : [true, "mobile number must be provided"],
        unique   : [true, "mobile number already exist"],
        trim     : true,
        validate : [validPhone, "enter a valid 10 digit mobile number without country code and 0"]
    },
    email :{
        type     : String,
        required : [true, "email address must be provided"],
        unique   : [true, "email address already exist"],
        trim     : true,
        lowercase: true,
        validate : [validEmail, "enter a valid email address"]
    },
    password :{
        type     : String,
        required : [true, "password must be provided"],
        minlength: 8,
        maxlength: 15
    },
    address :{
        street : {type :String, trim : true},
        city   : {type :String, trim : true},
        pincode: {type :String, trim : true}

    }

}, {timestamps : true})


module.exports = mongoose.model("User", userSchema)
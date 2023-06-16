const mongoose = require('mongoose')

const subCategorySchema = new mongoose.Schema({
    name:{
        type: String,
        trim : true, 
        unique:[true, "SubCategory must be unique"],
        minlength:[2, "too short SubCategory name"],
        maxlength:[32, "too long SubCategory name"]
    },
    slug:{
        type: String,
        lowercase: true
    },
    category: {
        type:mongoose.Schema.ObjectId, 
        ref: 'Category',
        required: [ true, 'Subcategory must belong to main category']
    }
     
}, {timestamps:true})


module.exports = mongoose.model('SubCategory', subCategorySchema)
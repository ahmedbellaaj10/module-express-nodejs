var mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
   name:{
     type:String,
     require:true
   },
   lastname:{
    type:String,
    require:true
  },
   password:{
     type:String,
     require:true
   },
   email:{
    type:String,
    require:true
  },
  picture:{
    type:String,
    require:false
  },
  age:{
    type:String,
    require:true
  },
  yearsOfExperience:{
    type:String,
    require:false
  },
  isAdmin:{
    type:Boolean,
    require:false,
  }
});

module.exports = User = mongoose.model('UserSchema',UserSchema);
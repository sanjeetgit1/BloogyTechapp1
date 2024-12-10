const mongoose = require('mongoose')
const crypto =require('crypto');
const { log } = require('console');
const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true,
        enum:["user","admin"],
        default:"user"
    },
    password:{
        type:String,
        required:true,

    },
    lastlogin:{
        type:Date,
        default:Date.now(),
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    accountLevel:{
        type:String,
        enum:["bronze","silver","gole"],
        default:"bronze"
    },
    porfilePicture:{
        type:String,
        default:""
    },
    coverImage:{
        type:String,
        default:" "
    },
    bio:{
        type:String,

    },
    location:{
        type:String,
    },
    notification:{
        email:{type:String}
    },
    gender:{
        type:String,
        enum:["Male", "Female", "prefer not to say", "non-binary"]
    },
    profileViewers:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],

followers:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
following:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
blockedUsers:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
posts:[{type:mongoose.Schema.Types.ObjectId, ref:"Post"}],
likedPost:[{type:mongoose.Schema.Types.ObjectId, ref:"Post"}],
passwordResetToken:{
    type:String,
},
passwordResetExpires:{
    type:Date,
},
accountVerificationToken:{
    type:String,
},
accountVerificationExpire:{
    type:Date
},

},
{
    timestamps:true,
}
);

userSchema.methods.generatePasswordResetToken= function(){
    //! generate token
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.passwordResetToken=crypto.createHash("sha256").update(resetToken).digest("hex");
 
    console.log("reset token", resetToken);
    console.log("hashed token", this.passwordResetToken);

//! set the expiry time to 10 min
this.passwordResetExpires=Date.now()+10 *60*1000;


    return resetToken;
    
    
};

userSchema.methods.generateAccountVerificationToken= function(){
    //! generate token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    this.accountVerificationToken=crypto.createHash("sha256").update(verificationToken).digest("hex");
 
    console.log("reset token", verificationToken);
    console.log("hashed token", this.accountVerificationToken);

//! set the expiry time to 10 min
this.accountVerificationExpire=Date.now()+10 *60*1000;


    return verificationToken;
    
    
};


//! convert schema to model
const User=mongoose.model("user",userSchema);
module.exports=User;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    }
})

//middleware function that will return a boolean, if the password matches and the username
//then pass through to the login index.
userSchema.statics.findAndValidate = async function (username, password) {
    //statics where you can define multiple methods that 
    //will be added to user itself/to the model 
    const foundUser = await this.findOne({ username });
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid ? foundUser : false;
    //if 'isValid' is true then return foundUser, if not set it to false.
}
//middleware function that hashes the password (when we execute the register 
//route we use mongoose and bcrypt as below to hash the pw)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    //if the user has not had its password modified, go to next, don't rehash password
    this.password = await bcrypt.hash(this.password, 12);
    //convert the password from form and hash it using bcrypt with 12 salts
    next();
    //next function will call save (calls line 46 on index.js)
})

module.exports = mongoose.model('User', userSchema);
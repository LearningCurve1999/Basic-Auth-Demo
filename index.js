const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');


main().catch(err => {
    console.log('Connection Error')
    console.log(err)
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/loginDemo', { useNewUrlParser: true, useUnifiedTopology: true, resave: true, saveUninitalized: false});
    console.log('Connection Established');
}


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret', resave:false, saveUninitialized: false }))

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}
app.get('/', (req, res) => {
    res.send('HOME PAGE FOR DEMO AUTHENTICATION')
})

app.get('/register', (req, res) => {
    res.render('register')
})

//This will save a request in the body or the text/string, that you created with a form.
app.post('/register', async (req, res) => {
    const { password, username } = req.body;
//Any input will be at this constant variable and can be accessed at req.body
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id;
//this will remember your credential first time you register
//and will be stored in the cookies browser.
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
 //this will test or validate if the username and password are matching,
    if (foundUser) {
        req.session.user_id = foundUser._id;
//this will remember your credential id that is being logged in, in your browser.
        res.redirect('/secret');
    }
    else {
        res.redirect('/login')
    }
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
//the sessionID needs to be set to false or null, to be able you to work this 
//if the userID is false, then redirect to login page.
    // req.session.destroy();
    res.redirect('/login');
})

app.get('/secret', requireLogin, (req, res) => {
//requireLogin is an additional security for those who only logged in and verified user valid by database
//if req.sessionID is not exist in the cookie browser then dont pass in on this route.
    res.render('secret')
})
app.get('/topsecret', requireLogin, (req, res) => {
//requireLogin
    res.send("TOP SECRET!!!")
})

app.listen(8700, () => {
    console.log("Listening on port 8700!")
})


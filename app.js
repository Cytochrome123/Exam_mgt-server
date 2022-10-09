const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const app = express()

const passportLocalStrategy = require('./auth/passport');
passportLocalStrategy(passport);


const db = require('./db');
// require('./db').connection
const { basic, admin, subAdmin, examiner } = require('./routes')

// app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
    optionsSuccessStatus: 200,

}))
// app.use(cors());

app.use(cookieParser());
app.use(session({
    secret: 'hud',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
}))

app.use(passport.initialize());
app.use(passport.session());


// app.use('/api', require('./routes/basic')())
app.use('/api', basic());
app.use('/api/admin', admin());
app.use('/api/subAdmin', subAdmin());
app.use('/api/examiner', examiner())

// app.post('/api/signup', (req,res)=>{
//     console.log(req.body);
// })

app.listen(process.env.PORT || 5000, () => {
    console.log('Server Connected!!!')
})
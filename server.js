
var express = require('express');
var db = require('./models/db');
var user = require('./models/user');
var challenges = require('./models/challengesdb');
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var path = require('path');
var session = require('express-session');
var ejslayout = require('express-ejs-layouts');
bcrypt = require("bcrypt");




var app = express();

app.use(ejslayout);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(cookieParser());

const saltRounds = 10;

var displayLink;

//session oluşturmak  için öncelikle session middleware'ını ekliyoruz.
app.use(
    session({
        key: "userId",
        secret: "somerandonstuffs",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 600000,
        },

    })
);

// üye login olduysa login i kapatmasını sağlayan kontrol mekanizması

app.use(function (req, res, next) {
    

    if (req.session.userId) {
        res.locals = {
            displayLink: false,


        }
    } else {
        res.locals = {
            displayLink: true,

        }

    }
    next();
});


app.use(function (req, res, next) {


    app.get('/challenge/:id', (req, res) => {
        var id = req.params.id;
        console.log(id);
        challenges.findOne({ challid: id }, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                res.statusCode = 200;
                res.render('chall', { challenge: data, username: req.session.username, displayLink });

            }

        });
    });












    app.get('/', function (req, res) {
        res.statusCode = 200;
        res.sendFile(path.join(__dirname, 'welcome.html'));

    });

    app.get('/logout', function (req, res) {
        req.session.destroy();
        res.redirect('/');
    });


    app.get('/challenge', function (req, res) {


        res.statusCode = 200;
        challenges.find({}, function (err, data) {
            if (err) {
                console.log(err);

            }

            else {

                if (req.session.userId) {
                    res.render('challenge', { challenges: data, username: req.session.username, displayLink });

                }
                else {
                    res.redirect('/login');


                }


            }


        });
    });










    app.get('/login', function (req, res) {


        res.statusCode = 200;

        res.sendFile(path.join(__dirname, 'login.html'));



    });







    app.get('/signup', function (req, res) {

        res.statusCode = 200;
        res.sendFile(path.join(__dirname, 'signup.html'));
    });






    app.get('/scoreboard', function (req, res) {

        res.statusCode = 200;
        user.find({}, function (err, users) {
            if (err) {
                console.log(err);
            } else {
                var a = users.sort(function (a, b) {
                    return b.score - a.score;
                });
                if (req.session.username) {
                    res.render('scoreboard', { users: a, username: req.session.username, displayLink });
                }
                else {
                    res.render('scoreboard', { users: a, username: "MonaCtf" });
                }




            }
        });


    });

    



        app.post('/login', async (req, res) => {
            try {

                const truser = await user.findOne({ username: req.body.username });

                if (truser) {
                    const cmp = await bcrypt.compare(req.body.password, truser.password);
                    if (cmp) {
                        //   ..... further code to maintain authentication like jwt or sessions
                        req.session.userId = truser._id;
                        req.session.username = truser.username;
                        res.redirect('/challenge');
                    } else {
                        res.redirect('/login');
                    }
                } else {
                    res.redirect('/login');
                }


            }
            catch (error) {
                console.log(error);
                res.status(500).send("Internal Server error Occured");
            }
        });

        app.get('/user', function (req, res) {
            res.statusCode = 200;
            res.redirect('/scoreboard');
        });


        app.get('/user/:username', function (req, res) {
            if (req.session.userId) {

                var username = req.params.username;
                user.findOne({ username: username }, function (err, data) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        user.find({}, function (err, users) {
                            if (err) {
                                console.log(err);
                            } else {
                                var a = users.sort(function (a, b) {
                                    return b.score - a.score;
                                });

                                var rank = a.findIndex(x => x.username == username) + 1;

                                res.statusCode = 200;
                                res.render('user', { user: data, username: req.session.username, displayLink, rank: rank });

                            }
                        });
                    }
                });
            }
            else {
                res.redirect('/login');
            }





        });





        app.post('/signup', async (req, res) => {

            console.log(req.body);
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
                const insertResult = await user.create({
                    name: req.body.name,
                    surname: req.body.surname,
                    username: req.body.username,
                    password: hashedPassword,
                    country: req.body.country,

                    score: 0
                });
                console.log(insertResult);

                res.redirect('/login');
            }
            catch (err) {
                console.log(err);
                res.status(500).send("Inernal Server Error");
            }




        });
        app.get('*', function (req, res) {

            res.statusCode = 404;
            res.sendFile(path.join(__dirname, '404.html'));
        });

        next();
    });



app.listen(3000);
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Post = require('./model/model');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

require('dotenv').config();
const PORT = process.env.PORT;

const { auth, requiresAuth } = require('express-openid-connect');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())



/*
mongoose.connect(
    process.env.MONGODB_URI,
    { 
        useNewUrlParser: true,
    }
)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err.message));
*/
mongoose.connect(
    'mongodb://127.0.0.1:27017',
    { 
        useNewUrlParser: true,
    }
)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err.message));



//app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static("uploads"));




const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASEURL,
  clientID: process.env.CLIENTID,
  issuerBaseURL: process.env.ISSUER
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));






app.get('/profilesddd', (req, res) => {
    res.json({
        isAuthenticated: req.oidc.isAuthenticated(),
        user: req.oidc.user,

    });
});

app.get('/profilesdd', requiresAuth(), (req, res) => {
    res.json(req.oidc.user, null, 2);
});



app.get('/posting', (req, res) => {
    res.sendFile(__dirname + "/public/posting.html");
});
app.get('/manage', (req, res) => {
    res.sendFile(__dirname + "/public/manage.html");
});





var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
var uploader = multer({ storage: storage });


// Configuration 
cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.APISECRET
});



var img;

app.post("/upload", uploader.single("file"), async (req, res) => {
    try {
        const upload = await cloudinary.uploader.upload(req.file.path);
        img = upload.secure_url;
        
        return res.json({
        success: true,
        file: upload.secure_url,
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(400).send("error");
    }
});





//create a post
app.post("/post", (req, res) => {
    try {

      const post = new Post({
        userID: req.oidc.user.sub,
        price: req.body.price,
        make: req.body.make,
        model: req.body.model,
        location: req.body.location,
        mileage: req.body.mileage,
        year: req.body.year,
        description: req.body.description,
        title: req.body.title,
        contact: req.body.contact,
        image: img
      });

      post.save().then(post => res.status(201).send(post));

    } catch (err) {
      console.error(err.message);
      res.status(400).send("error");
    }
});

//get all posts
app.get("/posts", async (req, res) => {
    try {
      const posts = await Post.find();
      //const posts = await Post.find().sort({ createdAt: -1 });
      res.status(200).json(posts);

    } catch (err) {
      console.error(err.message);
      res.status(400).send("error");
    }
});

//get all of a user's posts
app.get("/userposts", async (req, res) => {
    try {
        const posts = await Post.find({userID: req.oidc.user.sub});
        res.status(200).json(posts);

    } catch (err) {
      console.error(err.message);
      res.status(400).send("error");
    }
});


//delete
app.delete("/delete/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const post = await Post.findByIdAndDelete(id);
      res.status(200).json(post);
    } catch (err) {
      res.status(400).json({ msg: err.message })
      res.status(400).send("error");
    }
});




app.listen(PORT, () => {
  console.log("server running on port");
});
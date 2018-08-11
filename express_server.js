const express      = require("express");
const app          = express();
const PORT         = process.env.PORT || 8080; // default port 8080
const bodyParser   = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

/*----------------------Database--------------------*/

const urlDatabase  = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

/*-----------------Helper Function-------------------*/

//Generate ShortURL & User ID
function generateRandomString() {
  var myURL = "";
  var myData = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for(var i = 0;i < 6; i++) {
    var indexOfMyURL = Math.floor(Math.random()*myData.length);
    myURL += myData[indexOfMyURL];
  }
  return myURL;
}

//Check whether the User already existing by checking user_email
function checkUser(email) {
  for (var user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
}

//If the user provide user_email, use the email to get user_id
function getUserIDbyEmail(userEmail){
  let thisUser;
  for(var user in users){
    if(users[user].email === userEmail){
      thisUser = users[user].id;
    }
  }
  return thisUser;
}

//If the user provide user_email, use the email to get user_password
function getUserPasswordByEmail(email) {
  for (var user in users) {
    if (email === users[user].email) {
      return users[user].password;
    }
  }
}
/*-----------------Routes-------------------*/

/*app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});*/

// GET, /urls - Main Page
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],  //this gives a specific user's id/email/password
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// GET, /register - Register Form
app.get("/register", (req, res) => {
  res.render("register_form");
});

//GET, /login - LoginForm
app.get("/login", (req, res) => {
  res.render("login_form");
});

//GET, /urls/new - Shorten a new longURL form
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//GET, /urls/:id - the Edit LongURL form
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//GET, /u/:id - take user to the longURL address by provide shortURL
app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//GET, /urls/:id/update - redirect client back to the Edit LongURL form
app.get("/urls/:id/update", (req, res) => {
  res.redirect("/urls/" + req.params.id);
});

//POST,
app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  urlDatabase[newURL] = "http://" + req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const {user_email, password} = req.body;
  if (checkUser(user_email)) {
    if (password === getUserPasswordByEmail(user_email)) {
      res.cookie("user_id", getUserIDbyEmail(user_email));
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// POST, /register - Process registration after user registered
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === "" || password === "") {
    res.sendStatus(400); //error if didn't provide email or password
  } else if (checkUser(email)){
    res.sendStatus(400); //error if provided an existing user
  } else {
    var userRandomID = generateRandomString();
    users[userRandomID] = {
      id: userRandomID,
      email: email,
      password: password
    };
    res.cookie("user_id", userRandomID); //set the new user-ID cookie
    res.redirect("/urls"); //take user back to main page
  }
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = "http://" + req.body.longURL;
  res.redirect("/urls/" + req.params.id);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

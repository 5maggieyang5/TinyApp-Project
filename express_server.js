const express       = require("express");
const app           = express();
const PORT          = process.env.PORT || 8080; // default port 8080
const bodyParser    = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt        = require('bcryptjs');

app.use(cookieSession({
  keys: ["Encrypted Cookie"]
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

/*----------------------Database--------------------*/

const urlDatabase  = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1_RandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2_RandomID"
  }
};

const users = {
  "user1_RandomID": {
    id: "user1_RandomID",
    email: "user1@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  "user2_RandomID": {
    id: "user2_RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10)
  }
};

/*-----------------Helper Functions-------------------*/

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

//Use user email to get user_id
function getUserIDbyEmail(userEmail){
  let thisUser;
  for(var user in users){
    if(users[user].email === userEmail){
      thisUser = users[user].id;
    }
  }
  return thisUser;
}

//Use user email to get user_password
function getUserPasswordByEmail(email) {
  for (var user in users) {
    if (email === users[user].email) {
      return users[user].password;
    }
  }
}

//Use user_id to find the urls that created by this user
function urlsForUser(id) {
  var urlForThisUser = {};
  for (var url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      urlForThisUser[url] = urlDatabase[url];
    }
  }
  return urlForThisUser;
}

/*-----------------Routes-------------------*/

//GET, /
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET, /urls - Main Page
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],  //this gives a specific user's id/email/password
    urls: urlsForUser(req.session.user_id)};
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
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//GET, /urls/:id - the Edit LongURL form
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL};
  if (req.session.user_id === urlDatabase[req.params.id].userID){
    res.render("urls_show", templateVars);
  } else {
    res.send("Sorry, you are not authorized to check this URL. Please kindly check if you have loged in or if the URL created by you, thanks.");
  }
});

//GET, /urls/:id/update - redirect client back to the Edit LongURL form
app.get("/urls/:id/update", (req, res) => {
  res.redirect("/urls/" + req.params.id);
});

//GET, /u/:id - take user to the longURL address by provide shortURL
app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// POST, /register - Process registration after user registered
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    res.sendStatus(400); //error if didn't provide email or password
  } else if (checkUser(email)){
    res.sendStatus(400); //error if provided an existing user
  } else {
    var userRandomID = generateRandomString();
    users[userRandomID] = {
      id: userRandomID,
      email: email,
      password: hashedPassword
    };
    req.session.user_id = getUserIDbyEmail(email);
    res.redirect("/urls");
  }
});

// POST, /login - Process login after user loged in
app.post("/login", (req, res) => {
  const {user_email, password} = req.body;
  if (checkUser(user_email)) {
    if (bcrypt.compareSync(password, getUserPasswordByEmail(user_email))) {
      req.session.user_id = getUserIDbyEmail(user_email);
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
});

// POST, /logout - Process logout after user loged out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//POST, /urls/new - process user shortening a new URL
app.post("/urls/new", (req, res) => {
  let newURL = generateRandomString();
  let user_id = req.session.user_id;
    urlDatabase[newURL] = {
      longURL: "http://" + req.body.longURL,
      userID: user_id
    }
    res.redirect("/urls");
});

//POST, /urls/:id/update - process user edited longURL
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = {
    longURL: "http://" + req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect("/urls");
});

//POST, /urls/:id/delete - process delete a URL
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id]["userID"]){
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

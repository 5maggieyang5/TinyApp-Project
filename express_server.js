const express      = require("express");
const app          = express();
const PORT         = process.env.PORT || 8080; // default port 8080
const bodyParser   = require("body-parser");
const cookieParser = require('cookie-parser');

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

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  var myURL = "";
  var myData = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for(var i = 0;i < 6; i++) {
    var indexOfMyURL = Math.floor(Math.random()*myData.length);
    myURL += myData[indexOfMyURL];
  }
  return myURL;
}

function checkUser(users, email) {
  for (var user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
}

function getUserIDbyEmail(userEmail){
  let thisUser;
  for(var user in users){
    if(users[user].email === userEmail){
      thisUser = users[user].id;
    }
  }
  return thisUser;
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// GET, /register - Register Form
app.get("/register", (req, res) => {
  res.render("register_form");
});

// POST, /register - Process registration
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (email === "" || password === "") {
    res.sendStatus(400);
  } else if (checkUser(users, email)){
    res.sendStatus(400);
  } else {
    var userRandomID = generateRandomString();
    users[userRandomID] = {
      id: userRandomID,
      email: email,
      password: password
    };
    res.cookie("user_id", userRandomID);
    res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id/update", (req, res) => {
  res.redirect("/urls/" + req.params.id);
});

app.post("/urls", (req, res) => {
  let newURL = generateRandomString();
  urlDatabase[newURL] = "http://" + req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const {username} = req.body;
  let thisUserId = getUserIDbyEmail(username);
  console.log(thisUserId);
  res.cookie("user_id", getUserIDbyEmail(username));
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
/*  console.log(urlDatabase[req.params.id]);
  console.log(req.body);*/
  urlDatabase[req.params.id] = "http://" + req.body.longURL;
  res.redirect("/urls/" + req.params.id);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

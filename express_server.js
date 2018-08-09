var express      = require("express");
var app          = express();
var PORT         = 8080; // default port 8080
var bodyParser   = require("body-parser");
var cookieParser = require('cookie-parser');

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

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let newURL = generateRandomString();
  urlDatabase[newURL] = "http://" + req.body.longURL;
  res.redirect("/urls");
})


app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls/:id/update", (req, res) => {
  res.redirect("/urls/" + req.params.id);
  })

app.post("/urls/:id/update", (req, res) => {
  console.log(urlDatabase[req.params.id]);
  console.log(req.body);
  urlDatabase[req.params.id] = "http://" + req.body.longURL;
  res.redirect("/urls/" + req.params.id);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

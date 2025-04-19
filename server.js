const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();


app.use(express.static("public"));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render("home");
})
app.get("/register", (req, res) => {
    res.render("register");
})
app.get("/terms&conditions", (req, res) => {
    res.render("terms");
})
app.get("/login", (req, res) => {
    res.render("login");
})
app.get("/shop", (req, res) => {
    res.render("shop");
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})
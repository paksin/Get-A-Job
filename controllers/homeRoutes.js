const router = require("express").Router();
var passport = require("passport");
require("dotenv").config();
const withAuth = require("../utils/auth");
const { User } = require("../models");

const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/google/callback",
      passReqToCallback: true,
    },
    async function (req, accessToken, refreshToken, profile, done) {
      var userData = await User.findOne({
        where: { email: profile.email },
      });
      if (!userData) {
        userData = await User.create({
          name: profile.displayName,
          email: profile.email,
          profile_pic: profile.picture,
        });
        console.log("New user created.");
      }
      console.log(userData);
      console.log(profile.displayName);
      console.log(profile.email);
      return done(null, userData);
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

router.get("/", (req, res) => {
  // once opened render home
  res.render("homepage");
});

router.get("/login", (req, res) => {
  // If the user is already logged in, redirect the request to another route
  res.render("login");
  console.log(req.user);
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/auth/failure",
  })
);

router.get("/auth/failure", (req, res) => {
  res.send("something went wrong...");
  return;
});

router.get("/auth", withAuth, (req, res) =>
  res.send(`Hello ${req.user.name}, ${req.user.id}`)
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.send("Goodbye");
  });
});

module.exports = router;

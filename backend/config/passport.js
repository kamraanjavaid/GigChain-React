const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const passport = require("passport");
const session = require("express-session");


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const defaultAvatar =
  "https://servicesthumbnailbucket.s3.ap-south-1.amazonaws.com/profile_avatar.jpg";
const defaultCover =
  "https://servicesthumbnailbucket.s3.ap-south-1.amazonaws.com/defaultCover.png";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.VITE_API_URL}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("Profile ID:", profile.id);
      console.log("Full Profile:", JSON.stringify(profile, null, 2));

      try {
        let user = await User.findOne({ googleId: profile.id }).exec();

        console.log("Search query:", { googleId: profile.id });
        console.log("Initial user search result:", user);

        if (user) {
          console.log("Existing user found, updating last login");
          user = await User.findOneAndUpdate(
            { googleId: profile.id },
            { lastLogin: new Date() },
            { new: true }
          ).exec();

          console.log("Updated user:", user);
          return done(null, user);
        }

        console.log("No user found, creating new user");

        const newUser = {
          googleId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          isVerified: true,
          profilePictureUrl: profile.photos[0]?.value || defaultAvatar,
          coverPictureUrl: defaultCover,
          lastLogin: new Date(),
          provider: "google",
        };

        console.log("Creating new user with data:", newUser);

        user = await User.create(newUser);
        console.log("New user created:", user);

        return done(null, user);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err);
      }
    }
  )
);

module.exports = passport;

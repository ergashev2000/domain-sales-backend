import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { loginUser } from "../services/authService.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await loginUser({ email, password });
        return done(null, user);
      } catch (error) {
        return done(null, false, { message: error.message });
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id);
  done(null, user);
});

export default passport;

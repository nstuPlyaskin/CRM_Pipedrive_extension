const express = require('express');
const path = require('path');
const passport = require('passport');
const { Strategy } = require('passport-oauth2');

const api = require('./api');
const config = require('./config');
const User = require('./db/user');

User.createTable();

const app = express();

passport.use(
	'pipedrive',
	new Strategy({
			authorizationURL: 'https://oauth.pipedrive.com/oauth/authorize',
			tokenURL: 'https://oauth.pipedrive.com/oauth/token',
			clientID: config.clientID || '',
			clientSecret: config.clientSecret || '',
			callbackURL: config.callbackURL || ''
		}, async (accessToken, refreshToken, profile, done) => {
				const userInfo = await api.getUser(accessToken);
				const user = await User.add(
					userInfo.data.name,
					accessToken,
					refreshToken
				);

				done(null, user);
		}
	)
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(async (req, res, next) => {
		req.user = await User.getById(1);
		next();
});

/* step 2 code goes here */

app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}`));

if (process.env.IS_LOCAL === 'true') {
	console.log(`🟢 App has started. \n🔗 Development URL: http://localhost:3000`);
} else {
	console.log(`🟢 App has started. \n🔗 Live URL: https://${process.env.PROJECT_DOMAIN}.glitch.me`);
}


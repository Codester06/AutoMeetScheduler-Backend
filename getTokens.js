import { google } from 'googleapis';
import readline from 'readline';
import 'dotenv/config';

const oauth2Client = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  process.env.G_REDIRECT_URI
);

// Generate a URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // <== IMPORTANT to get refresh token
  scope: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ],
});

console.log('\n🚀 Visit this URL to authorize:\n');
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nPaste the code here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n🎉 Your tokens:');
    console.log('G_ACCESS_TOKEN=' + tokens.access_token);
    console.log('G_REFRESH_TOKEN=' + tokens.refresh_token);
    rl.close();
  } catch (err) {
    console.error('Error retrieving access token', err);
    rl.close();
  }
});

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { google } from 'googleapis';
import sgMail from '@sendgrid/mail';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(bodyParser.json());
const mail = process.env.G_MAIL

// ===== GOOGLE OAUTH SETUP =====
const oauth2Client = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  process.env.G_REDIRECT_URI
);

oauth2Client.setCredentials({
  access_token: process.env.G_ACCESS_TOKEN,
  refresh_token: process.env.G_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// ===== SENDGRID SETUP =====
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ===== OAUTH CALLBACK =====
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Authorization code not provided');
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('✅ OAuth tokens received:');
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    res.send(`
      <html><body>
        <h2>✅ Authorization Successful!</h2>
        <pre>
G_ACCESS_TOKEN=${tokens.access_token}
G_REFRESH_TOKEN=${tokens.refresh_token}
        </pre>
      </body></html>
    `);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('OAuth authorization failed');
  }
});

// ===== GENERATE AUTH URL =====
app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
  });
  res.json({ authUrl });
});

// ===== CREATE CALENDAR EVENT & SEND EMAIL =====
app.post('/schedule', async (req, res) => {
  const { name, email, dateTime } = req.body;
  
  let meetingScheduled = false;
  let emailSent = false;
  let meetLink = null;
  let errorMessage = null;

  try {
    const startTime = new Date(dateTime).toISOString();
    const endTime = new Date(new Date(dateTime).getTime() + 30 * 60000).toISOString();

    // ===== CREATE GOOGLE CALENDAR EVENT =====
    try {
      const event = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: {
          summary: `Meeting with ${name}`,
          description: 'Auto-scheduled via your app',
          start: { dateTime: startTime, timeZone: 'Asia/Kolkata' },
          end: { dateTime: endTime, timeZone: 'Asia/Kolkata' },
          attendees: [{ email }],
          conferenceData: {
            createRequest: {
              requestId: `req-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        }
      });

      meetLink = event.data.conferenceData.entryPoints?.[0]?.uri;
      meetingScheduled = true;
      console.log('✅ Meeting scheduled successfully');
      console.log('Meet link:', meetLink);
    } catch (calendarError) {
      console.error('❌ Calendar error:', calendarError);
      return res.status(500).json({ 
        error: 'Failed to create calendar event',
        details: calendarError.message 
      });
    }

    // ===== SEND EMAIL via SendGrid =====
    try {
      await sgMail.send({
        to: email,
        from: "viveksharma55236@gmail.com",
        subject: `Meeting Scheduled with ${name}`,
        html: `
          <h3>Your Meeting is Scheduled!</h3>
          <p><strong>When:</strong> ${new Date(dateTime).toLocaleString()}</p>
          <p><strong>Meet Link:</strong> <a href="${meetLink} ">${meetLink}</a></p>
          <p>Looking forward to connecting!</p>
        `,
      });
      emailSent = true;
      console.log('📧 Email sent successfully to:', email);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Don't throw error here - meeting is still scheduled
    }

    // ===== RESPOND BASED ON RESULTS =====
    if (meetingScheduled && emailSent) {
      res.json({ 
        message: 'Meeting scheduled & email sent successfully!', 
        meetLink,
        status: 'success'
      });
    } else if (meetingScheduled && !emailSent) {
      res.json({ 
        message: 'Meeting scheduled successfully! However, email notification could not be sent. Please save the meeting link.', 
        meetLink,
        status: 'partial_success',
        warning: 'Email notification failed'
      });
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    res.status(500).json({ 
      error: 'An unexpected error occurred',
      details: err.message 
    });
  }
});

app.listen(5001, () => console.log('🚀 Server running on port 5001'));
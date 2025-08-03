import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(bodyParser.json());
const mail = process.env.G_MAIL;

// ===== GOOGLE OAUTH SETUP =====
const oauth2Client = new google.auth.OAuth2(
  process.env.G_CLIENT_ID,
  process.env.G_CLIENT_SECRET,
  process.env.G_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.G_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// ===== NODEMAILER SMTP SETUP =====
const transporter = nodemailer.createTransport({
  service: "gmail", // Or use {host, port, secure} for custom SMTP
  auth: {
    user: process.env.G_MAIL,
    pass: process.env.SMTP_PASS, // App password (or normal SMTP password)
  },
    timeout: 6000,
});

// ===== EMAIL TEMPLATE FUNCTION =====
function generateMeetingEmail(name, dateTime, meetLink) {
  const startTime = new Date(dateTime);
  const endTime = new Date(startTime.getTime() + 30 * 60000);
  
  // Format dates for calendar link
  const formatForCalendar = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Meeting with ' + name)}&dates=${formatForCalendar(startTime)}/${formatForCalendar(endTime)}&details=${encodeURIComponent('Meeting scheduled via booking system.\n\nJoin here: ' + meetLink)}&location=${encodeURIComponent(meetLink)}`;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meeting Scheduled</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.7;
                color: #2c3e50;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .email-wrapper {
                max-width: 650px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                position: relative;
            }
            
            .header {
                background: linear-gradient(135deg, #d4b896 0%, #c9a876 100%);
                color: white;
                padding: 50px 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="80" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="60" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                pointer-events: none;
            }
            
            .header h1 {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 10px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                position: relative;
                z-index: 1;
            }
            
            .header p {
                font-size: 18px;
                opacity: 0.9;
                position: relative;
                z-index: 1;
            }
            
            .content {
                padding: 50px 40px;
                background: #ffffff;
            }
            
            .greeting {
                font-size: 20px;
                color: #2c3e50;
                margin-bottom: 25px;
                font-weight: 600;
            }
            
            .intro-text {
                font-size: 16px;
                color: #5a6c7d;
                margin-bottom: 30px;
            }
            
            .meeting-details {
                background: linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%);
                border: 1px solid #e1e8ed;
                border-radius: 15px;
                padding: 30px;
                margin: 35px 0;
                position: relative;
                overflow: hidden;
            }
            
            .meeting-details::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: linear-gradient(135deg, #d4b896 0%, #c9a876 100%);
            }
            
            .detail-item {
                margin: 20px 0;
                padding: 15px 0;
                border-bottom: 1px solid #e8f0fe;
                display: flex;
                align-items: center;
            }
            
            .detail-item:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-weight: 700;
                color: #34495e;
                margin-right: 15px;
                min-width: 120px;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .detail-value {
                color: #2c3e50;
                font-size: 16px;
                font-weight: 500;
            }
            
            .button-container {
                text-align: center;
                margin: 40px 0;
                padding: 20px 0;
            }
            
            .meet-button {
                display: inline-block;
                background: linear-gradient(135deg, #d4b896 0%, #c9a876 100%);
                color: white;
                padding: 18px 35px;
                text-decoration: none;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                margin: 10px 15px;
                transition: all 0.3s ease;
                box-shadow: 0 8px 25px rgba(212, 184, 150, 0.3);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .meet-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 35px rgba(212, 184, 150, 0.4);
            }
            
            .calendar-button {
                display: inline-block;
                background: linear-gradient(135deg, #d4b896 0%, #c9a876 100%);
                color: white;
                padding: 18px 35px;
                text-decoration: none;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                margin: 10px 15px;
                transition: all 0.3s ease;
                box-shadow: 0 8px 25px rgba(212, 184, 150, 0.3);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .calendar-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 35px rgba(212, 184, 150, 0.4);
            }
            
            .tips {
                background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
                border: 1px solid #ffeaa7;
                border-radius: 15px;
                padding: 25px;
                margin: 35px 0;
                position: relative;
            }
            
            .tips::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            }
            
            .tips h4 {
                color: #856404;
                margin-bottom: 15px;
                font-size: 18px;
                font-weight: 700;
            }
            
            .tips ul {
                color: #856404;
                margin: 0;
                padding-left: 25px;
            }
            
            .tips li {
                margin: 10px 0;
                font-size: 15px;
                line-height: 1.6;
            }
            
            .divider {
                height: 2px;
                background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
                margin: 35px 0;
                border-radius: 1px;
            }
            
            .closing-text {
                font-size: 16px;
                color: #5a6c7d;
                margin: 20px 0;
                line-height: 1.8;
            }
            
            .signature {
                margin-top: 40px;
                padding-top: 25px;
                border-top: 1px solid #e9ecef;
            }
            
            .signature-name {
                font-weight: 700;
                color: #2c3e50;
                font-size: 16px;
            }
            
            .footer {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 30px 40px;
                text-align: center;
                color: #6c757d;
                font-size: 14px;
                border-top: 1px solid #dee2e6;
            }
            
            .footer p {
                margin: 8px 0;
                line-height: 1.6;
            }
            
            .footer a {
                color: #667eea;
                text-decoration: none;
                font-weight: 500;
                transition: color 0.3s ease;
            }
            
            .footer a:hover {
                color: #5a6fd8;
            }
            
            /* Responsive Design */
            @media (max-width: 600px) {
                .header, .content, .footer {
                    padding: 30px 25px;
                }
                
                .header h1 {
                    font-size: 26px;
                }
                
                .header p {
                    font-size: 16px;
                }
                
                .meeting-details {
                    padding: 20px;
                }
                
                .detail-item {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .detail-label {
                    margin-bottom: 5px;
                    margin-right: 0;
                }
                
                .meet-button, .calendar-button {
                    display: block;
                    margin: 15px 0;
                    padding: 15px 25px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <h1>Meeting Scheduled Successfully!</h1>
                <p>Your appointment has been confirmed</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello ${name},
                </div>
                
                <p class="intro-text">
                    Excellent! Your meeting has been successfully scheduled. We're looking forward to our conversation and the opportunity to connect with you.
                </p>
                
                <div class="meeting-details">
                    <div class="detail-item">
                        <span class="detail-label">Date & Time:</span>
                        <span class="detail-value">${new Date(dateTime).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZoneName: 'short'
                        })}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">30 minutes</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Platform:</span>
                        <span class="detail-value">Google Meet Video Call</span>
                    </div>
                </div>
                
                <div class="button-container">
                    <a href="${meetLink}" class="meet-button">
                        Join Meeting
                    </a>
                    <a href="${calendarUrl}" class="calendar-button" target="_blank">
                        Add to Calendar
                    </a>
                </div>
                
                <div class="tips">
                    <h4>Meeting Preparation Tips</h4>
                    <ul>
                        <li>Save this meeting to your calendar using the "Add to Calendar" button above</li>
                        <li>Join the meeting 5 minutes early to test your audio and video</li>
                        <li>Ensure you have a stable internet connection for the best experience</li>
                        <li>Test your camera and microphone settings beforehand</li>
                        <li>Prepare any documents or materials you'd like to discuss</li>
                        <li>Find a quiet, well-lit space for optimal video quality</li>
                    </ul>
                </div>
                
                <div class="divider"></div>
                
                <p class="closing-text">
                    If you need to reschedule or have any questions before our meeting, please don't hesitate to reach out. We're here to help and ensure everything goes smoothly.
                </p>
                
                <p class="closing-text">
                    Thank you for scheduling this meeting with us. We're excited to speak with you and discuss how we can work together.
                </p>
                
                <div class="signature">
                    <p>Best regards,</p>
                    <p class="signature-name">Your Meeting Team</p>
                </div>
            </div>
            
            <div class="footer">
                <p>This meeting was automatically scheduled through our booking system.</p>
                <p>Meeting Link: <a href="${meetLink}">${meetLink}</a></p>
                <p>Please save this email for your records.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// ===== ENHANCED LOGGING UTILITY =====
const logInfo = (section, message, data = null) => {
  console.log(`\n🔹 [${section}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logError = (section, message, error = null) => {
  console.error(`\n❌ [${section}] ${message}`);
  if (error) {
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

const logSuccess = (section, message, data = null) => {
  console.log(`\n✅ [${section}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// ===== OAUTH CALLBACK WITH ENHANCED LOGGING =====
app.get("/oauth2callback", async (req, res) => {
  logInfo("OAuth Callback", "Processing OAuth callback request");
  logInfo("OAuth Callback", "Query parameters received:", req.query);
  
  const { code } = req.query;
  
  if (!code) {
    logError("OAuth Callback", "Authorization code not provided");
    return res.status(400).send("Authorization code not provided");
  }
  
  logInfo("OAuth Callback", "Authorization code received:", { code: code.substring(0, 20) + "..." });
  
  try {
    logInfo("OAuth Callback", "Exchanging code for tokens...");
    const { tokens } = await oauth2Client.getToken(code);
    
    logSuccess("OAuth Callback", "OAuth tokens received successfully");
    logInfo("OAuth Callback", "Token details:", {
      access_token: tokens.access_token ? tokens.access_token.substring(0, 20) + "..." : "Not received",
      refresh_token: tokens.refresh_token ? tokens.refresh_token.substring(0, 20) + "..." : "Not received",
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : "Not set"
    });
    
    oauth2Client.setCredentials(tokens);
    logSuccess("OAuth Callback", "Credentials set on OAuth client");
    
    // Full tokens for environment variables (be careful with these in production)
    console.log("\n🔑 ENVIRONMENT VARIABLES:");
    console.log("G_ACCESS_TOKEN=" + tokens.access_token);
    console.log("G_REFRESH_TOKEN=" + tokens.refresh_token);
    
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
    logError("OAuth Callback", "OAuth authorization failed", error);
    res.status(500).send("OAuth authorization failed");
  }
});

// ===== GENERATE AUTH URL WITH ENHANCED LOGGING =====
app.get("/auth", (req, res) => {
  logInfo("Auth URL", "Generating authentication URL");
  
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ];
  
  logInfo("Auth URL", "Requested scopes:", scopes);
  
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
    
    logSuccess("Auth URL", "Authentication URL generated successfully");
    logInfo("Auth URL", "Generated URL:", { authUrl });
    
    res.json({ authUrl });
    
  } catch (error) {
    logError("Auth URL", "Failed to generate auth URL", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
});

// ===== CREATE CALENDAR EVENT & SEND EMAIL WITH ENHANCED LOGGING =====
app.post("/schedule", async (req, res) => {
  logInfo("Schedule", "New meeting scheduling request received");
  logInfo("Schedule", "Request body:", req.body);
  
  const { name, email, dateTime } = req.body;
  
  // Validate input
  if (!name || !email || !dateTime) {
    logError("Schedule", "Missing required fields", { name: !!name, email: !!email, dateTime: !!dateTime });
    return res.status(400).json({ error: "Missing required fields: name, email, or dateTime" });
  }
  
  logInfo("Schedule", "Processing meeting for:", { name, email, dateTime });

  let meetingScheduled = false;
  let emailSent = false;
  let meetLink = null;
  let calendarEventId = null;

  try {
    // Calculate meeting times
    const startTime = new Date(dateTime).toISOString();
    const endTime = new Date(new Date(dateTime).getTime() + 30 * 60000).toISOString();
    
    logInfo("Schedule", "Calculated meeting times:", {
      startTime,
      endTime,
      duration: "30 minutes"
    });

    // ===== CREATE GOOGLE CALENDAR EVENT =====
    logInfo("Calendar", "Creating Google Calendar event...");
    
    try {
      const eventRequest = {
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: {
          summary: `Meeting with ${name}`,
          description: "Auto-scheduled via your app",
          start: { dateTime: startTime, timeZone: "Asia/Kolkata" },
          end: { dateTime: endTime, timeZone: "Asia/Kolkata" },
          attendees: [{ email }],
          conferenceData: {
            createRequest: {
              requestId: `req-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        },
      };
      
      logInfo("Calendar", "Event request details:", eventRequest);
      
      const event = await calendar.events.insert(eventRequest);
      
      calendarEventId = event.data.id;
      meetLink = event.data.conferenceData?.entryPoints?.[0]?.uri;
      meetingScheduled = true;
      
      logSuccess("Calendar", "Meeting scheduled successfully");
      logInfo("Calendar", "Event details:", {
        eventId: calendarEventId,
        meetLink,
        status: event.data.status,
        htmlLink: event.data.htmlLink,
        created: event.data.created,
        organizer: event.data.organizer
      });
      
    } catch (calendarError) {
      logError("Calendar", "Failed to create calendar event", calendarError);
      return res.status(500).json({
        error: "Failed to create calendar event",
        details: calendarError.message,
      });
    }

    // ===== SEND EMAIL via NodeMailer =====
    logInfo("Email", "Sending email notification...");
    
    try {
      const mailOptions = {
        from: `"Meeting Scheduler" <${mail}>`,
        to: email,
        subject: `Meeting Scheduled - ${new Date(dateTime).toLocaleDateString()}`,
        html: generateMeetingEmail(name, dateTime, meetLink),
      };
      
      logInfo("Email", "Email options:", {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHtml: !!mailOptions.html
      });
      
      const emailResult = await transporter.sendMail(mailOptions);
      emailSent = true;
      
      logSuccess("Email", "Email sent successfully");
      logInfo("Email", "Email result:", {
        messageId: emailResult.messageId,
        response: emailResult.response,
        envelope: emailResult.envelope
      });
      
    } catch (emailError) {
      logError("Email", "Failed to send email", emailError);
    }

    // ===== RESPOND BASED ON RESULTS =====
    logInfo("Response", "Preparing response...");
    
    const responseData = {
      meetingScheduled,
      emailSent,
      meetLink,
      calendarEventId,
      meetingTime: startTime,
      attendee: { name, email }
    };
    
    logInfo("Response", "Response data:", responseData);
    
    if (meetingScheduled && emailSent) {
      logSuccess("Response", "Complete success - meeting scheduled and email sent");
      res.json({
        message: "Meeting scheduled & email sent successfully!",
        meetLink,
        eventId: calendarEventId,
        status: "success",
      });
    } else if (meetingScheduled && !emailSent) {
      logSuccess("Response", "Partial success - meeting scheduled but email failed");
      res.json({
        message: "Meeting scheduled successfully! However, email notification could not be sent. Please save the meeting link.",
        meetLink,
        eventId: calendarEventId,
        status: "partial_success",
        warning: "Email notification failed",
      });
    }
    
  } catch (err) {
    logError("Schedule", "Unexpected error during scheduling", err);
    res.status(500).json({
      error: "An unexpected error occurred",
      details: err.message,
    });
  }
});

// ===== SERVER STARTUP WITH ENHANCED LOGGING =====
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 =================================`);
  console.log(`🚀 Meeting Scheduler Server Started`);
  console.log(`🚀 =================================`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📅 Available endpoints:`);
  console.log(`   GET  /auth - Generate OAuth URL`);
  console.log(`   GET  /oauth2callback - OAuth callback`);
  console.log(`   POST /schedule - Schedule meeting`);
  console.log(`🚀 =================================\n`);
});

// ===== ADDITIONAL DEBUGGING ENDPOINTS =====
app.get("/debug/tokens", (req, res) => {
  logInfo("Debug", "Token status requested");
  const credentials = oauth2Client.credentials;
  
  const tokenInfo = {
    hasAccessToken: !!credentials.access_token,
    hasRefreshToken: !!credentials.refresh_token,
    tokenType: credentials.token_type,
    expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
    isExpired: credentials.expiry_date ? Date.now() > credentials.expiry_date : null
  };
  
  logInfo("Debug", "Current token status:", tokenInfo);
  res.json(tokenInfo);
});

app.get("/debug/calendar", async (req, res) => {
  logInfo("Debug", "Calendar access test requested");
  
  try {
    const calendarList = await calendar.calendarList.list();
    logSuccess("Debug", "Calendar access successful");
    logInfo("Debug", "Available calendars:", calendarList.data.items?.map(cal => ({
      id: cal.id,
      summary: cal.summary,
      primary: cal.primary
    })));
    
    res.json({
      status: "success",
      calendars: calendarList.data.items?.length || 0
    });
    
  } catch (error) {
    logError("Debug", "Calendar access failed", error);
    res.status(500).json({
      status: "error",
      error: error.message
    });
  }
});

// ===== ERROR HANDLING MIDDLEWARE =====
app.use((err, req, res, next) => {
  logError("Express", "Unhandled error", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  logInfo("Server", "SIGTERM received, shutting down gracefully");
  server.close(() => {
    logInfo("Server", "Server closed");
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logInfo("Server", "SIGINT received, shutting down gracefully");
  process.exit(0);
});
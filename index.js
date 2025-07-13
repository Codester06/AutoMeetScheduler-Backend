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
  access_token: process.env.G_ACCESS_TOKEN,
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

// ===== OAUTH CALLBACK =====
app.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Authorization code not provided");
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log("✅ OAuth tokens received:");
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);
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
    console.error("OAuth error:", error);
    res.status(500).send("OAuth authorization failed");
  }
});

// ===== GENERATE AUTH URL =====
app.get("/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
  res.json({ authUrl });
});

// ===== CREATE CALENDAR EVENT & SEND EMAIL =====
app.post("/schedule", async (req, res) => {
  const { name, email, dateTime } = req.body;

  let meetingScheduled = false;
  let emailSent = false;
  let meetLink = null;

  try {
    const startTime = new Date(dateTime).toISOString();
    const endTime = new Date(
      new Date(dateTime).getTime() + 30 * 60000
    ).toISOString();

    // ===== CREATE GOOGLE CALENDAR EVENT =====
    try {
      const event = await calendar.events.insert({
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
      });

      meetLink = event.data.conferenceData.entryPoints?.[0]?.uri;
      meetingScheduled = true;
      console.log("✅ Meeting scheduled successfully");
      console.log("Meet link:", meetLink);
    } catch (calendarError) {
      console.error("❌ Calendar error:", calendarError);
      return res.status(500).json({
        error: "Failed to create calendar event",
        details: calendarError.message,
      });
    }

    // ===== SEND EMAIL via NodeMailer =====
    try {
      await transporter.sendMail({
        from: `"Meeting Scheduler" <${mail}>`,
        to: email,
        subject: `Meeting Scheduled - ${new Date(
          dateTime
        ).toLocaleDateString()}`,
        html: generateMeetingEmail(name, dateTime, meetLink),
      });
      emailSent = true;
      console.log("📧 Email sent successfully to:", email);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
    }

    // ===== RESPOND BASED ON RESULTS =====
    if (meetingScheduled && emailSent) {
      res.json({
        message: "Meeting scheduled & email sent successfully!",
        meetLink,
        status: "success",
      });
    } else if (meetingScheduled && !emailSent) {
      res.json({
        message:
          "Meeting scheduled successfully! However, email notification could not be sent. Please save the meeting link.",
        meetLink,
        status: "partial_success",
        warning: "Email notification failed",
      });
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    res.status(500).json({
      error: "An unexpected error occurred",
      details: err.message,
    });
  }
});

app.listen(5001, () => console.log("🚀 Server running on port 5001"));

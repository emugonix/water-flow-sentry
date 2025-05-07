import { MailService } from '@sendgrid/mail';
import { LeakEvent, Sensor, User } from '@shared/schema';
import { db } from '@db';
import { eq, not, isNull } from 'drizzle-orm';
import { users } from '@shared/schema';

// Initialize SendGrid
const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'notifications@watermonitor.example.com',
      subject: params.subject,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendLeakAlertEmails(leakEvent: LeakEvent, sensor: Sensor): Promise<void> {
  try {
    // Get all users with email notifications enabled
    const subscribedUsers = await db
      .select()
      .from(users)
      .where(
        // Must have email notifications enabled and an email address
        eq(users.emailNotifications, true) && 
        not(isNull(users.email))
      );

    // Filter based on high priority only setting if applicable
    const eligibleUsers = subscribedUsers.filter(user => {
      // If leak is high severity, send to all
      if (leakEvent.severity === 'high') return true;
      
      // Otherwise only send to users who accept all alerts
      return !user.highPriorityOnly;
    });

    // Don't proceed if no eligible users
    if (eligibleUsers.length === 0) {
      console.log('No eligible users for email notifications');
      return;
    }

    // Send emails to each eligible user
    const emailPromises = eligibleUsers.map(user => {
      // Skip if no email (safety check)
      if (!user.email) return Promise.resolve(false);
      
      // Create HTML content for email
      const htmlContent = `
        <h2>Water Leak Alert</h2>
        <p>A potential water leak has been detected in your system.</p>
        <table style="border-collapse: collapse; width: 100%; margin-top: 20px; margin-bottom: 20px;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Severity</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${leakEvent.severity.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Location</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${sensor.location}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Sensor</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${sensor.name}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Flow Rate</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${leakEvent.flowRate} L/min</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Time Detected</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${new Date(leakEvent.detectedAt).toLocaleString()}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="${process.env.APP_URL || 'http://localhost:5000'}" 
             style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            Open Dashboard
          </a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          You're receiving this alert because you've enabled email notifications in your Water Monitor settings.
          To manage your notification preferences, please visit the settings page in your account.
        </p>
      `;
      
      return sendEmail({
        to: user.email,
        subject: `${leakEvent.severity.toUpperCase()} Alert: Water Leak Detected at ${sensor.location}`,
        html: htmlContent
      });
    });
    
    // Wait for all emails to be sent
    await Promise.all(emailPromises);
    console.log(`Sent leak alert emails to ${emailPromises.length} users`);
    
  } catch (error) {
    console.error('Failed to send leak alert emails:', error);
  }
}
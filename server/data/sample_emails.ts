/**
 * Sample phishing and legitimate emails for testing and bootstrapping training.
 */

export interface SampleEmail {
  text: string;
  label: "phishing" | "safe";
}

export const SAMPLE_EMAILS: SampleEmail[] = [
  // --- PHISHING EMAILS ---
  {
    label: "phishing",
    text: `Subject: URGENT: Verify your PayPal account immediately!
Dear PayPal Customer,
We detected a suspicious login attempt to your account from an ip address in Russia. To secure your account, you must click the link below and login to verify your credentials.
http://paypal-secure-portal.com/login/update/verify-account.html
If you do not verify your identity within 24 hours, your account and debit card will be permanently suspended.
Sincerely,
PayPal Security Team`
  },
  {
    label: "phishing",
    text: `Subject: Security Alert: Unauthorized login attempt detected
Your Chase bank account has been locked due to multiple failed login attempts.
To unlock your account, click here to access the secure portal and update your passcode:
http://192.168.102.11/chase/portal-login.html
Please have your card details and account number ready. Action is required immediately to prevent wire fraud.
Thank you,
Chase Customer Assistance`
  },
  {
    label: "phishing",
    text: `Subject: Netflix Account Hold - Payment Failure
Dear Netflix Member,
Your subscription failed to renew because your credit card on file was declined.
To avoid service interruption and get back to watching your favorite shows, please update your billing info now:
http://netflix-login-reset.click/billing/update-password
We appreciate you being with us.
The Netflix billing support team`
  },
  {
    label: "phishing",
    text: `Subject: CONGRATULATIONS! You won $10,000,000 Free Money Lottery Winnings!
Dear Lucky Winner,
You have been chosen through our random computer selection process to receive a total sum of ten million dollars ($10,000,000) from the International Lottery Club and Cash Prize Foundation.
To claim your free money prize, reply to this email with your:
1. Full Name
2. Bank Details
3. Phone Number
Contact coordinates details: claim-prize-now@xyz-rewards.top
Congratulations!`
  },
  {
    label: "phishing",
    text: `Subject: Account Temporary Suspension - Action Required within 48 Hours
Your Microsoft Office 365 login has expired and needs immediate validation.
Please sign in to the password reset and authentication portal to maintain access to outlook, sharepoint, and drive:
http://microsoft-outlook-support.xyz/auth-portal/login.html
Failure to confirm within 48 hours will result in permanent loss of corporate data.`
  },
  {
    label: "phishing",
    text: `Subject: Amazon Order Shipped: Verify shipping address
We have received your order for the Apple iPhone 15 Pro Max ($1499.00). We loaded this transaction to your credit card.
If you did not authorize this purchase, you must login now to cancel the shipment and get a full refund:
http://amazon-support-refund.club/verify-login/index.php
If you do not cancel, the package will be delivered to 123 Hackers Lane.
Sincerely,
Amazon Order Systems`
  },
  {
    label: "phishing",
    text: `Subject: Urgent invoice payment notification
Hi,
Please find attached the overdue invoice #88432 for the outstanding sum of $4,500.00.
We require immediate wire transfer to our new bank details. Click here to download the full statement document and route codes:
http://apple-secure-billing.loan/auth/billing
Regards,
Accounts Receivable Department`
  },
  {
    label: "phishing",
    text: `Subject: Verify your cryptocurrency wallet immediately
MetaMask security alert: Unauthorized login with IP address 122.3.4.156 detected.
Your wallet has been placed on strict hold. Please verify your recovery passphrases and backup keys here to restore full authorization:
http://metamask-auth-portal.xyz/verify-login/
Do not share this link with anyone.`
  },
  {
    label: "phishing",
    text: `Subject: Apple Support: ID Locked Alert
Security notice: Your Apple ID account was accessed from an unrecognized web browser.
To restore access, click below to verify your login credentials, confirm your credit card, and sign in:
http://apple-support-reset.click/authenticate/login/
Apple Security Response Team`
  },
  {
    label: "phishing",
    text: `Subject: You requested a password reset
Hello,
A temporary password reset link was requested for your corporate secure server portal.
Click below to finalize this transaction and enter a new password:
http://corporate-login-reset.work/update-password.html
If you did not initiate this, please secure your login credentials immediately.`
  },

  // --- SAFE / LEGITIMATE EMAILS ---
  {
    label: "safe",
    text: `Subject: Weekly Project Status Updates
Hi team,
We had a productive week. Here are the key highlights:
1. Sarah completed the frontend layout designs for the user dashboard.
2. The server-side API endpoints are now connected.
3. We have integrated Jest for unit testing.
Our next standup is scheduled for Wednesday at 10 AM on Google Meet. Let's make sure everyone updates their Jira tasks.
Best regards,
John (Project Manager)`
  },
  {
    label: "safe",
    text: `Subject: Meeting Agenda: Marketing Strategy Q3
Hi All,
I have compiled the draft slide deck for the Q3 marketing kickoff. Please review the key slides before our sync meeting tomorrow.
We'll be discussing user acquisition channels, budget constraints, and potential brand ambassadors.
See you all on Thursday at 2:00 PM in the main conference room.
Thanks,
Clara`
  },
  {
    label: "safe",
    text: `Subject: Your invoice for cloud hosting services (May 2026)
Hello,
Thank you for hosting your web applications with us. This is a courtesy notification that your monthly receipt or invoice is ready.
Amount billed: $43.20
This has been charged automatically to your credit card on file. No action is required from you.
You can view your detailed usage logs in your settings dashboard.
HostProvider Billing Team`
  },
  {
    label: "safe",
    text: `Subject: GitHub: New login from unrecognized device
Hi coder-alice,
We noticed a new login to your GitHub account from a Chrome browser on a Linux system.
If this was you, there is no need to worry.
If you do not recognize this login, please review your account activity, audit your security keys, and consider changing your password.
GitHub Security Center`
  },
  {
    label: "safe",
    text: `Subject: Welcome to the weekly developer newsletter!
Welcome to CodeDigest!
In this edition, we explore the new TypeScript 5.8 feature-set, React 19 concurrent features, and how to build efficient Node.js workers.
Read the blog posts on our official website or listen to the podcast episode.
Happy coding!
The CodeDigest Team`
  },
  {
    label: "safe",
    text: `Subject: Lunch tomorrow?
Hey,
Just checking if you're free to catch up for lunch tomorrow around noon?
There's a new Italian pizzeria that opened up down the street near the park, and I wanted to check it out.
Let me know if that works or if we should plan for Thursday instead!
Talk soon,
David`
  },
  {
    label: "safe",
    text: `Subject: Vacation Approval Notice
Hi Emily,
Your time-off request for June 12 to June 19 has been approved by your department lead.
Please ensure all outstanding code reviews are assigned, and update your calendar invite to include an Out of Office alert.
Hope you have a fantastic holiday!
HR Operations`
  },
  {
    label: "safe",
    text: `Subject: Invitation: Alumni Networking Night
Dear Class of 2022,
You are warmly invited to our annual University Alumni Networking Dinner.
This year we are hosting panels focusing on technology, finance, and design, featuring prominent figures from local startups and organizations.
Date: June 5th, 6:30 PM
Location: Grand Alumni Hall
Please RSVP to secure your seat.
Warmly,
Alumni Relations Office`
  },
  {
    label: "safe",
    text: `Subject: Code Review Request: App login validation flows
Hey Alex,
I pushed a pull request containing the revised authentication state hook and input validators.
Could you take a look at the branch and provide feedback on the modular error handlers?
The tests are running fine locally.
Thanks!
Marcus`
  },
  {
    label: "safe",
    text: `Subject: Dental appointment confirmation
Hello,
This is to confirm your scheduling for a dental cleaning with Dr. Henderson.
Time: Friday, May 29, at 9:00 AM
Please arrive 10 minutes early to fill out any updated insurance forms. If you need to reschedule, please notify our reception desk.
See you then,
BrightSmile Dental Clinic`
  }
];

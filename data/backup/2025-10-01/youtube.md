# Multi-Factor Authentication & AWS Budget Alerts - YouTube Video Script

**Video Type:** Tutorial/Hands-On Demo  
**Target Duration:** 15-20 minutes  
**Difficulty Level:** Beginner  
**Target Audience:** AWS beginners, students preparing for Cloud Practitioner certification

---

## 📊 Video Metadata

**Title:** AWS Account Security: Enable MFA & Set Budget Alerts (Step-by-Step)

**Description:**
Secure your AWS account and protect yourself from unexpected bills! In this tutorial, you'll learn how to enable Multi-Factor Authentication (MFA) for maximum security and set up budget alerts to monitor your AWS spending.

Perfect for AWS beginners who just created their account and want to follow security best practices from day one.

✅ Enable MFA in under 5 minutes
✅ Set up budget alerts to avoid surprise charges
✅ Protect your root account from unauthorized access

🔗 Free Study Notes: [Link to complete notes]
📚 Practice MCQs: [Link to quiz]

**Tags:** AWS, MFA, Multi-Factor Authentication, AWS Budget, Billing Alerts, Cloud Security, AWS Tutorial, Beginners, Free Tier, Cloud Practitioner, Account Security, AWS Cost Management

**Thumbnail Text:** Secure Your AWS Account!

---

## 🎬 Script Sections

### INTRO (0:00 - 1:00)

**[SLIDE 1: Title Card]**

**SPEAKER:**
"Hey everyone! Welcome back to AWS Training Series. I'm [Your Name], and today we're covering two CRITICAL tasks you must complete right after creating your AWS account: enabling Multi-Factor Authentication and setting up budget alerts.

[Pause - show title slide]

Here's the deal: Your AWS root account has unlimited access to everything. If someone steals your password, they could launch hundreds of servers and stick YOU with a $10,000 bill. We're going to prevent that in the next 15 minutes.

[Pause as bullet points appear]

By the end of this video, you'll know:
- How to enable MFA for unbreakable account security
- How to set budget alerts so you never get surprise charges
- Why these two steps are non-negotiable for every AWS user

This is essential for anyone starting with AWS, so let's jump right in!"

**[TIMING: 50-60 seconds]**
**[TRANSITION: Fade to next slide]**

---

### SECTION 1: Understanding MFA (1:00 - 4:00)

**[SLIDE 2: "What is MFA?"]**

**SPEAKER:**
"First, let's understand what Multi-Factor Authentication actually is.

[Show definition on screen]

Think of it like your house security. A password is like having a lock on your door. MFA is like adding a security camera, alarm system, AND a guard dog. Even if someone steals your key, they still can't get in.

[Pause for analogy to sink in]

Here's how it works: When you log into AWS, you enter your password - that's factor one. Then AWS asks for a 6-digit code that changes every 30 seconds on your phone - that's factor two. Without BOTH, nobody gets in.

[Show MFA flow diagram]

Now here's why this matters: Last year, 80% of data breaches involved stolen passwords. But with MFA? Hackers would need your password AND your phone. That's why Amazon REQUIRES MFA for root accounts in production.

[Pause - emphasize importance]

The best part? It takes literally 3 minutes to set up, and you can use a free app on your phone."

**[TIMING: 2-3 minutes]**
**[VISUAL CUES: Definition → Analogy → Flow diagram → Statistics]**
**[TRANSITION: "Okay, let's set it up"]**

---

### SECTION 2: Hands-On MFA Setup (4:00 - 10:00)

**[SLIDE 3: "Let's Enable MFA - Live Demo"]**

**SPEAKER:**
"Alright, time to secure your account. I'm going to do this live in the AWS Console, and you can follow along step-by-step.

[Switch to screen recording]

Step 1: Open AWS Console and sign in as root user. Click your account name in the top right corner, then click 'Security Credentials.'

[Show cursor movements clearly]

Notice the big warning here? 'Your root account is not protected by MFA.' Let's fix that.

Step 2: Scroll down to 'Multi-factor authentication' and click 'Assign MFA device.'

[Pause on this screen]

Step 3: Give your MFA device a name - I'll call mine 'MyPhone-MFA.' Choose 'Authenticator app' as the MFA device type.

Now, before we continue, you need an authenticator app on your phone. I recommend Google Authenticator or Microsoft Authenticator - both are free.

[Show app download screens]

Step 4: Open your authenticator app and click 'Add account' or the plus icon. Choose 'Scan QR code.'

[Show phone screen scanning]

See this QR code on AWS? Point your phone camera at it. The app will automatically add your AWS account.

[Show successful scan]

Step 5: Now you'll see a 6-digit code on your phone that changes every 30 seconds. Enter the current code in the first box on AWS.

[Type code on screen]

Wait for the code to change - this takes about 30 seconds. Then enter the NEW code in the second box.

[Type second code]

Why two codes? AWS is verifying your app is synced correctly with their servers.

Step 6: Click 'Add MFA.' Done!

[Show success message]

From now on, every time you log in, AWS will ask for your password PLUS the code from your phone. Your account is now dramatically more secure.

Let me show you what login looks like now...

[Demonstrate login with MFA]

See? Password, then MFA code. Without your phone, nobody's getting in."

**[TIMING: 5-6 minutes]**
**[SCREEN RECORDING NOTES]:**
- Zoom cursor for clarity
- Highlight sections being clicked
- Show phone screen for QR scan
- Pause on important screens
- Show successful MFA login

**[TRANSITION: "Now let's protect your wallet"]**

---

### SECTION 3: Understanding AWS Costs (10:00 - 12:00)

**[SLIDE 4: "Why Budget Alerts Matter"]**

**SPEAKER:**
"Now that your account is secure, let's talk about the second thing that keeps AWS users up at night: unexpected bills.

[Show horror story screenshot]

Real story from Reddit: Student leaves EC2 instance running for 3 months, gets $2,400 bill. Another one: Accidentally launches 50 instances instead of 5, gets $1,200 bill overnight.

[Pause - let that sink in]

Here's the thing about AWS: It's incredibly easy to launch resources. One click and you've got servers running. And the meter is always running.

[Show billing meter animation]

That's where budget alerts come in. Think of them like your bank sending you a text when your account drops below $100. We're going to tell AWS: 'If my bill approaches $10, email me immediately.'

This is your safety net. Free tier or not, you set a budget and AWS watches it for you 24/7."

**[TIMING: 2 minutes]**
**[VISUAL: Screenshots of real bills, budget alert concept]**

---

### SECTION 4: Hands-On Budget Setup (12:00 - 17:00)

**[SLIDE 5: "Setting Up Budget Alerts - Live Demo"]**

**SPEAKER:**
"Let's set up your budget alert right now. This takes about 5 minutes.

[Switch to screen recording]

Step 1: In AWS Console, search for 'Billing' in the top search bar. Click 'Billing and Cost Management.'

[Show navigation]

You might see a message about enabling IAM user access - we'll ignore that for now since we're using root.

Step 2: In the left sidebar, click 'Budgets' under Cost Management.

[Navigate to Budgets]

Click 'Create budget.'

Step 3: Choose budget type. We want 'Cost budget' - this tracks how much you're spending. Click Next.

[Select cost budget]

Step 4: Set your budget details:
- Budget name: I'll call it 'Monthly-Free-Tier-Budget'
- Period: Monthly
- Budget amount: $10

[Type values on screen]

Why $10? The free tier is completely free IF you stay within limits. $10 gives you a safety margin. If you hit $10, something's wrong and you need to investigate.

Step 5: Scroll down to 'Budget scope.' Leave it as 'All AWS services' - we want to track everything.

Click Next.

Step 6: Set up alerts. This is the most important part.

Click 'Add an alert threshold.'

[Configure alert]

- Threshold: 80% of budgeted amount
- That's $8 out of our $10 budget
- Email recipients: Enter your email address

[Type email]

Add a second alert:
- Threshold: 100% of budgeted amount
- Same email address

[Add second alert]

Why two alerts? The first one at 80% is your warning - time to check what's running. The second at 100% is your emergency alert - stop everything and investigate.

Step 7: Click Next, review everything, then click 'Create budget.'

[Show creation]

Done! AWS will now monitor your spending 24/7. If you hit $8, you get an email. If you hit $10, you get another email.

[Show confirmation]

Let me show you what the email looks like when an alert triggers...

[Show example alert email]

This email tells you exactly how much you've spent, what triggered the alert, and links to investigate further.

One last tip: Check your billing dashboard once a week. Don't wait for alerts.

[Show billing dashboard]

See this? It shows your month-to-date charges. I check this every Monday. Takes 30 seconds and gives you peace of mind."

**[TIMING: 4-5 minutes]**
**[SCREEN RECORDING NOTES]:**
- Clear navigation
- Zoom on important fields
- Show alert configuration clearly
- Display example alert email
- Show billing dashboard

---

### SECTION 5: Best Practices & Tips (17:00 - 18:30)

**[SLIDE 6: "🔒 Security Best Practices"]**

**SPEAKER:**
"Before we wrap up, here are three critical best practices:

[Show points on screen]

Number 1: NEVER share your root account credentials. Not with teammates, not with contractors, nobody. Create IAM users instead - we'll cover that in a future video.

Number 2: Backup your MFA. Take a screenshot of the QR code during setup and store it securely. If you lose your phone, you'll need this to recover access.

Number 3: Set multiple budgets. I recommend:
- One monthly budget at $10 for overall spending
- One forecasted budget that predicts if you'll exceed limits
- Individual budgets for expensive services if you're experimenting

[Pause]

And one more thing about costs: The free tier covers most learning activities, but READ THE LIMITS. For example:
- EC2: 750 hours per month FREE (one t2.micro instance 24/7)
- S3: 5GB storage FREE
- RDS: 750 hours FREE

Stay within these limits and you pay nothing. Exceed them, and charges start immediately. That's why budget alerts are so important."

**[TIMING: 1.5 minutes]**
**[VISUAL: Best practices checklist, free tier limits table]**

---

### OUTRO (18:30 - 20:00)

**[SLIDE 7: Summary + Call to Action]**

**SPEAKER:**
"Alright, let's recap what we accomplished today:

[Points appear on screen]

✓ You enabled MFA on your root account - now it's virtually unhackable
✓ You set up budget alerts at $8 and $10 - no surprise bills
✓ You learned free tier limits to stay within bounds

These two steps should be the FIRST things you do after creating any AWS account. I cannot overstate how important they are.

[Pause]

In the next video, we'll create IAM users so you stop using your root account for daily work. We'll also explore the AWS Console in detail.

If this helped you, hit that like button and subscribe for more AWS tutorials. I post new videos every week covering everything you need for the Cloud Practitioner certification.

Got questions? Drop them in the comments and I'll answer every single one.

Complete notes for this video, including screenshots and step-by-step instructions, are linked in the description below - totally free.

Thanks for watching, and I'll see you in the next one!"

**[TIMING: 60-90 seconds]**
**[VISUAL: End screen with subscribe button, next video, notes link]**

---

## 📝 Production Notes

**B-Roll Needed:**
- AWS Console screenshots of MFA setup screens
- Phone screenshots of authenticator apps
- Budget alert email examples
- Billing dashboard views

**On-Screen Text:**
- Highlight "Multi-Factor Authentication" when first mentioned
- Show phone app names (Google Authenticator, Microsoft Authenticator)
- Display budget amounts ($10, 80%, 100%)
- Show free tier limits clearly

**Pacing:**
- Speak clearly at ~140 words/minute
- Pause 2-3 seconds after showing complex screens
- Repeat critical steps (budget thresholds, email setup)

**Editing Markers:**
- [CUT] - Remove any mistakes
- [ZOOM] - Zoom into specific Console elements
- [HIGHLIGHT] - Draw attention to buttons/fields
- [B-ROLL] - Insert example screenshots
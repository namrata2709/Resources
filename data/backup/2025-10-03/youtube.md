# MFA & Budget Alerts - YouTube Video Script

**Video Type:** Tutorial/Lecture  
**Target Duration:** 15-20 minutes  
**Difficulty Level:** Beginner  
**Target Audience:** AWS beginners, students preparing for Cloud Practitioner certification

---

## 📊 Video Metadata

**Title:** AWS Account Protection: MFA & Budget Alerts Tutorial | Prevent Hacking & Surprise Bills

**Description:**
Secure your AWS account and control costs in under 20 minutes! Learn how to enable Multi-Factor Authentication (MFA) to block hackers and set up Budget Alerts to avoid surprise bills.

In this tutorial, you'll learn:
✅ What MFA is and why it's critical for AWS security
✅ How to set up Google Authenticator in 5 minutes
✅ Creating Zero Spend and Monthly Cost budgets
✅ Protecting both your account security AND your wallet

🔗 Free Study Notes: [Link to complete notes]
📚 Practice MCQs: [Link to quiz]
💼 Next Video: EC2 & AMI Fundamentals

**Tags:** AWS, MFA, Multi-Factor Authentication, AWS Budgets, Cloud Security, Cost Management, AWS Tutorial, Cloud Practitioner, Free Tier, AWS Account Security, Google Authenticator, Budget Alerts

**Thumbnail Text:** STOP HACKERS + SURPRISE BILLS

---

## 🎬 Script Sections

### INTRO (0:00 - 1:15)

**[SLIDE 1: Title Card with thumbnail visual]**

**SPEAKER:**
"Hey everyone! Welcome back to AWS Training. I'm [Your Name], and today we're covering the TWO most important things you need to do on DAY ONE of creating an AWS account.

[Pause - show split screen: hacker icon vs dollar bill icon]

Number one: Multi-Factor Authentication - this stops hackers from stealing your account even if they get your password.

Number two: Budget Alerts - this prevents you from getting a $500 surprise bill because you forgot to stop an EC2 instance.

[Show quick stats on screen]

Every month, thousands of AWS accounts get hacked. And every week, students get massive bills they didn't expect. Today, I'm going to show you how to prevent BOTH of these problems in under 20 minutes.

Let's jump in!"

**[TIMING: 75 seconds]**
**[TRANSITION: Fade to next slide]**

---

### SECTION 1: What is MFA? (1:15 - 4:30)

**[SLIDE 2: "What is Multi-Factor Authentication?"]**

**SPEAKER:**
"First, let's understand what MFA actually means.

MFA stands for Multi-Factor Authentication. It's like having TWO locks on your door instead of one.

[Show animation of two factors]

Factor one: Your password - something you KNOW.
Factor two: A code from your phone - something you HAVE.

[Pause - let animation play]

Here's why this matters. Let's say a hacker steals your AWS password from a data breach. Without MFA, they just log in and start launching expensive resources. Game over.

But WITH MFA enabled, they hit a wall. They can't log in because they don't have your phone generating that 6-digit code.

[Show blocked hacker animation]

This is why AWS and every security expert on the planet says: ALWAYS enable MFA on your Root user.

Now, there are three types of MFA devices AWS supports...

[Show three columns appearing]

Virtual MFA - this is an app on your phone like Google Authenticator. It's free, it's easy, and it's what most people use.

Hardware tokens - physical devices that generate codes. More secure but costs $10-50.

Security keys - USB devices like YubiKey. Most secure, but also costs money.

For beginners, I recommend Virtual MFA with Google Authenticator. It's free and takes 5 minutes to set up."

**[TIMING: 3 minutes 15 seconds]**
**[VISUAL CUES: Two-factor animation → Blocked hacker → Three device types]**
**[TRANSITION: Smooth fade]**

---

### SECTION 2: How MFA Works (4:30 - 7:00)

**[SLIDE 3: MFA Login Flow Diagram]**

**SPEAKER:**
"Let me show you exactly what happens when you log in with MFA enabled.

[Point to flowchart as you explain]

Step one: You enter your email and password like normal.

Step two: AWS checks your credentials. If they're correct, AWS doesn't let you in yet - it asks for your MFA code.

Step three: You open Google Authenticator on your phone.

Step four: You see a 6-digit code. Let's say it's 123456.

Step five: You type that code into AWS.

Step six: AWS verifies it matches what it expects, and BOOM - you're in.

[Pause on success screen]

Now here's the cool part. That code changes every 30 seconds. So even if someone's watching over your shoulder and sees you type 123456, by the time they try to use it, it's already expired.

This uses something called TOTP - Time-based One-Time Password. The app on your phone and AWS both have a shared secret key, and they use the current time to generate matching codes.

Pretty clever, right?"

**[TIMING: 2 minutes 30 seconds]**
**[SCREEN RECORDING: Demo of MFA login flow]**

---

### SECTION 3: Hands-On - Enable MFA (7:00 - 11:00)

**[SLIDE 4: "Let's Set It Up!"]**

**SPEAKER:**
"Alright, enough theory. Let's actually enable MFA on your AWS account.

[Switch to screen recording]

First, make sure you have Google Authenticator installed on your phone. I'll put download links in the description. It's free on both iPhone and Android.

Got it? Good. Now, sign in to the AWS Console as your Root user.

[Show clicking through UI]

Click your account name in the top right corner.
Select 'Security credentials'.

Scroll down to the Multi-factor authentication section.
Click 'Assign MFA device'.

[Zoom into screen]

Give it a name. I'll call mine 'my-phone-mfa'.
Select 'Authenticator app'.
Click Next.

Now AWS shows you a QR code. This is the magic moment.

[Show phone and computer screen]

Open Google Authenticator on your phone.
Tap the plus button.
Choose 'Scan a QR code'.
Point your camera at this QR code on your screen.

Boom! AWS appears in your app with a 6-digit code.

[Show entering codes]

Now here's important: AWS asks for TWO consecutive codes. Why? To verify your phone's clock is synced correctly.

Enter the first code. Let's say it's 847392.
Wait 30 seconds for it to change.
Enter the new code. Now it's 923018.

Click 'Add MFA'.

[Show success message]

And you're done! See that green success message? Your Root account is now protected by MFA.

Let's test it.

[Show logout and login]

Sign out. Sign back in with your email and password.
Now AWS asks for your MFA code.
Check Google Authenticator - enter the code.
And you're in!

That's MFA in action. Your account just became 100 times more secure."

**[TIMING: 4 minutes]**
**[SCREEN RECORDING: Full MFA setup walkthrough with zoom on important steps]**

---

### SECTION 4: What are Budget Alerts? (11:00 - 13:30)

**[SLIDE 5: "AWS Budget Alerts"]**

**SPEAKER:**
"Now let's protect your wallet with Budget Alerts.

AWS Budget Alerts are like setting a spending limit on your credit card. You tell AWS: 'Hey, if my bill goes above X dollars, send me an email.'

[Show budget concept diagram]

There are two types of alerts you can set up:

Actual cost alerts - these trigger when you've ALREADY spent a certain amount.

Forecasted cost alerts - these are smarter. AWS looks at your spending pattern and predicts: 'Hey, at this rate, you're going to spend $100 by month-end.' It warns you BEFORE you actually hit the limit.

[Show comparison animation]

For example, it's day 10 of the month. You've spent $8. AWS calculates: if you keep spending at this rate, you'll hit $24 by day 30. If your budget is $20, you get an alert NOW, not later.

This early warning gives you time to stop resources and avoid overspending.

Now, there are four types of budgets, but beginners need to know about two:

Zero Spend Budget - alerts if you spend more than one cent. Perfect for Free Tier users.

Monthly Cost Budget - set a monthly limit like $10 or $50.

The first two budgets are FREE. After that, AWS charges 60 cents per month per budget. But trust me, that 60 cents is worth avoiding a $500 surprise bill."

**[TIMING: 2 minutes 30 seconds]**
**[VISUAL: Budget diagram → Alert flow animation]**

---

### SECTION 5: Hands-On - Create Budget (13:30 - 17:00)

**[SLIDE 6: "Create Your First Budget"]**

**SPEAKER:**
"Let's create a Zero Spend Budget right now.

[Switch to screen recording]

In the AWS Console, click your account name.
Select 'Billing and Cost Management'.

In the left sidebar, click 'Budgets'.

Click the orange 'Create budget' button.

[Show template selection]

AWS gives you templates to make this easy. Select 'Use a template'.
Choose 'Zero spend budget'.

This is already configured to alert you if spending exceeds one cent.

[Show configuration]

Give it a name: 'MyZeroSpendBudget'.
Enter your email address. This is where alerts will go.

The scope is 'All AWS Services' - this monitors everything.

Click 'Create budget'.

[Show success]

Done! You'll get a confirmation email. Make sure you click the confirmation link.

[Show email]

See this email? Click 'Confirm subscription'. Now you're all set.

If you accidentally launch something that costs money, you'll get an email within a few hours.

Want to set up a monthly budget too? Let me show you quick.

[Fast walkthrough]

Create budget → Customize → Cost budget.
Set amount: $20.
Set alerts at 80% ($16) and 100% ($20).
Enter email → Create.

Now you have two layers of protection: Zero Spend catches accidents, Monthly Budget tracks intentional spending.

You're now protected from surprise bills!"

**[TIMING: 3 minutes 30 seconds]**
**[SCREEN RECORDING: Budget creation with highlights on key fields]**

---

### SECTION 6: Best Practices (17:00 - 18:30)

**[SLIDE 7: "Pro Tips"]**

**SPEAKER:**
"Before we wrap up, let me give you three pro tips.

Tip number one: Save your MFA backup codes.
When you set up MFA, AWS gives you backup codes. Save these in a password manager. If you lose your phone, these codes can save you from getting locked out.

Tip number two: Don't ignore budget alerts.
If you get an alert that says you hit 80% of your budget, don't just delete the email. Go check what's running. You probably forgot to stop an EC2 instance.

Tip number three: Enable MFA on IAM users too, not just Root.
Once you start creating IAM users for your team, enable MFA on admin accounts. It's the same process we just showed you.

[Show quick comparison table]

Remember: MFA protects against hackers. Budgets protect against overspending. You need BOTH."

**[TIMING: 1 minute 30 seconds]**
**[VISUAL: Three tips appear with icons]**

---

### OUTRO (18:30 - 19:30)

**[SLIDE 8: Summary + Call to Action]**

**SPEAKER:**
"Alright, let's recap what we covered today.

[Bullet points appear]

Multi-Factor Authentication - adds a second lock to your AWS account using your phone.
Google Authenticator - free app that generates 6-digit codes every 30 seconds.
Zero Spend Budget - alerts immediately if you incur any charges.
Monthly Cost Budget - tracks spending with early warnings.

You now have a secure AND cost-protected AWS account. That's what every professional does on day one.

If you found this helpful, hit that like button and subscribe. I'm publishing AWS tutorials every week, and next week we're diving into EC2 instances and AMIs - how to actually launch servers in AWS.

I've linked the complete study notes in the description - they're totally free and include practice questions.

Got questions? Drop them in the comments and I'll answer every single one.

Thanks for watching, and I'll see you in the next video!"

**[TIMING: 60 seconds]**
**[VISUAL: End screen with subscribe button, next video preview, links]**

---

## 📝 Production Notes

**B-Roll Needed:**
- Hacker trying to break into locked door (blocked by MFA)
- Person shocked looking at large bill → then relieved with alert notification
- Split screen: phone with authenticator app + AWS Console

**On-Screen Text:**
- "Factor 1: Password" and "Factor 2: One-Time Code" when explaining MFA
- "30 seconds" when showing code expiration
- "$0.01 threshold" for Zero Spend Budget
- "FREE for first 2 budgets" when discussing costs

**Pacing:**
- Speak at ~140 words/minute
- Pause 2-3 seconds after showing important screens
- Slow down during hands-on steps (screen recording)

**Editing Markers:**
- [ZOOM] when entering MFA codes on screen
- [HIGHLIGHT] QR code scanning moment
- [ZOOM] budget threshold configuration fields
- Speed up navigation clicks to 1.5x speed
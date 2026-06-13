# Brevo SMTP Setup Guide

This guide will help you configure Brevo (formerly Sendinblue) for sending emails from your Vendle application.

## Why Brevo?

- ✅ **300 emails/day FREE** (perfect for team invitations and notifications)
- ✅ No credit card required
- ✅ Professional email delivery
- ✅ Email analytics and tracking
- ✅ Reliable infrastructure

---

## Step 1: Create Brevo Account

1. Go to: **https://app.brevo.com/account/register**
2. Sign up with your email address
3. Verify your email
4. Complete onboarding:
   - Select **"Transactional"** as your primary use case
   - Skip any optional steps

---

## Step 2: Get SMTP Credentials

1. Log into Brevo dashboard
2. Click your name (top right) → **SMTP & API**
3. Click the **SMTP** tab
4. You'll see:
   ```
   Server: smtp-relay.brevo.com
   Port: 587
   Login: your-brevo-email@example.com
   ```
5. Click **"Generate a new SMTP key"** or **"Create a new SMTP key"**
6. **Copy the key** (it looks like: `xkeysib-xxx...`)
   - ⚠️ Save this key somewhere safe - you can't view it again!

---

## Step 3: Update Environment Variables

Open your `.env` file and update these values:

```bash
# SMTP email settings - Brevo Configuration
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email@example.com        # The email you used to sign up
SMTP_PASS=xkeysib-your-actual-smtp-key-here   # The key you just generated
SMTP_SECURE=false
NOTIFICATIONS_FROM_EMAIL=noreply@vendle.com   # Or use your verified domain
```

**Replace:**
- `your-brevo-email@example.com` → Your Brevo account email
- `xkeysib-your-actual-smtp-key-here` → The SMTP key you copied

---

## Step 4: Restart Your Development Server

After updating the `.env` file:

```bash
# Stop your current server (Ctrl+C)
# Then restart:
pnpm dev
```

---

## Step 5: Test Your Configuration

### Option A: Use the Test Page
1. Navigate to: **http://localhost:3000/dashboard/test-email**
2. Enter your email address
3. Click "Send Test Email"
4. Check your inbox (and spam folder)

### Option B: Test via Team Invitation
1. Go to: **http://localhost:3000/dashboard/team**
2. Invite a team member
3. They should receive an invitation email

---

## Step 6: Verify Sender Domain (Optional - Recommended for Production)

For better email deliverability and to avoid spam filters:

1. In Brevo dashboard → **Senders & IP**
2. Click **"Add a sender"**
3. Add your domain (e.g., `vendle.com`)
4. Follow the verification steps (add DNS records)
5. Once verified, update `.env`:
   ```bash
   NOTIFICATIONS_FROM_EMAIL=noreply@yourdomain.com
   ```

---

## Troubleshooting

### Emails Not Sending?

**Check 1: Environment Variables**
```bash
# Make sure these are set in .env:
echo $SMTP_HOST      # Should show: smtp-relay.brevo.com
echo $SMTP_USER      # Should show your email
echo $SMTP_PASS      # Should show: xkeysib-...
```

**Check 2: Server Restart**
- Did you restart the dev server after updating `.env`?
- Run: `pnpm dev`

**Check 3: Brevo Dashboard**
- Go to **Logs** → **Email Activity**
- Check if emails are being sent from Brevo's side

**Check 4: SMTP Key**
- Make sure you copied the full key including `xkeysib-` prefix
- Check for extra spaces or line breaks

### Emails Going to Spam?

**Solution: Verify your domain in Brevo**
- Add SPF, DKIM, and DMARC records
- Use a professional "from" address (not gmail/yahoo)
- Example: `notifications@yourdomain.com`

---

## Current Email Usage

Vendle sends emails for:

1. **Team Member Invitations**
   - Existing users: Notification email
   - New users: Invitation with signup link

2. **Future Use Cases** (ready to implement):
   - Order confirmations
   - Payment receipts
   - Subscription reminders
   - Password resets

---

## Brevo Free Tier Limits

- **300 emails/day**
- **9,000 emails/month**
- No expiration
- No credit card required

This is more than enough for:
- Team invitations
- Important notifications
- Transaction emails

---

## Upgrade Options (If Needed)

If you exceed 300 emails/day:

| Plan | Price | Emails/Month |
|------|-------|--------------|
| Free | $0 | 9,000 |
| Starter | $25/mo | 20,000 |
| Business | $65/mo | 100,000 |
| Enterprise | Custom | Unlimited |

---

## Support

**Brevo Documentation:** https://help.brevo.com/hc/en-us/articles/209467485-Configure-your-SMTP-settings

**Vendle Email Code:** 
- Notification functions: `app/lib/notifications.ts`
- Team invitations: `app/lib/actions.ts` (inviteTeamMemberAction)
- Test endpoint: `app/api/test-email/route.ts`

---

## Next Steps

1. ✅ Create Brevo account
2. ✅ Get SMTP credentials
3. ✅ Update `.env` file
4. ✅ Restart dev server
5. ✅ Test with `/dashboard/test-email`
6. ✅ Invite a team member to test
7. 🚀 You're ready to go!

---

**Need Help?**

If you encounter issues, check the Brevo logs in their dashboard under **Logs → Email Activity** to see if emails are being rejected or bounced.

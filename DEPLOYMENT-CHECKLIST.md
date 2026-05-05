# Vendle MVP Deployment Checklist

## Pre-Deployment

### Database Setup
- [ ] Run all table creation scripts in production database:
  ```bash
  node create-products-table.js
  node create-orders-table.js
  node create-analytics-table.js
  ```
- [ ] Verify all tables exist with correct schema
- [ ] Test database connection from production environment

### Environment Variables
- [ ] Set `POSTGRES_URL` with production database credentials
- [ ] Set `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` to production domain (e.g., `https://vendle.app`)
- [ ] Verify all environment variables are properly configured

### Code Review
- [ ] Remove any console.logs with sensitive data
- [ ] Remove hardcoded database credentials from scripts
- [ ] Verify error handling is in place
- [ ] Check that all API routes are protected with authentication
- [ ] Ensure analytics tracking doesn't block critical flows

### Security
- [ ] Verify NextAuth is properly configured
- [ ] Check that vendor data is isolated (can't access other vendors' data)
- [ ] Ensure SQL injection protection (using parameterized queries)
- [ ] Verify CORS settings if needed
- [ ] Check rate limiting for public endpoints

## Deployment Steps

### 1. Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Configure Domain
- [ ] Add custom domain in Vercel dashboard
- [ ] Update DNS records
- [ ] Verify SSL certificate is active
- [ ] Update `NEXTAUTH_URL` to match production domain

### 3. Post-Deployment Verification
- [ ] Test landing page loads
- [ ] Test sign up flow
- [ ] Test sign in flow
- [ ] Create test product
- [ ] Visit public store
- [ ] Place test order
- [ ] Verify order appears in dashboard
- [ ] Check analytics tracking
- [ ] Test on mobile device

## Monitoring

### Set Up Monitoring
- [ ] Configure Vercel Analytics
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor database performance
- [ ] Set up uptime monitoring

### Key Metrics to Track
- [ ] Sign-up conversion rate
- [ ] Store creation rate
- [ ] Order completion rate
- [ ] Average products per vendor
- [ ] Average orders per vendor
- [ ] Page load times
- [ ] Error rates

## Post-Launch

### User Onboarding
- [ ] Create onboarding documentation
- [ ] Prepare demo video
- [ ] Set up support channel (WhatsApp/Email)
- [ ] Create FAQ document

### Marketing Assets
- [ ] Prepare social media posts
- [ ] Create demo store for showcasing
- [ ] Prepare pitch deck for vendors
- [ ] Design promotional materials

### Feedback Collection
- [ ] Set up feedback form
- [ ] Plan user interviews
- [ ] Monitor support requests
- [ ] Track feature requests

## Rollback Plan

If issues occur:
1. Revert to previous Vercel deployment
2. Check error logs in Vercel dashboard
3. Verify database connectivity
4. Check environment variables
5. Test in staging environment before re-deploying

## Nice-to-Haves (Post-MVP)

Priority order for future iterations:
1. **Payment Integration** (Paystack/Flutterwave)
2. **WhatsApp Notifications** (order alerts to vendor)
3. **Image Upload** (Cloudinary/S3)
4. **Email Notifications**
5. **Advanced Analytics** (charts, trends)
6. **Discount Codes**
7. **Multi-user Access**
8. **Inventory Management**
9. **Delivery Tracking**
10. **Customer Accounts**

## Success Criteria

MVP is successful if:
- ✅ 10+ vendors create stores in first week
- ✅ 50+ products listed across all stores
- ✅ 20+ orders placed through the platform
- ✅ <2% error rate
- ✅ <3s average page load time
- ✅ Positive feedback from early users

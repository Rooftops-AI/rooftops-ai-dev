# AI Employee Pro - User Journey Guide

## Overview

AI Employee Pro transforms your roofing business into a 24/7 operation with automated lead response, follow-up sequences, and customer communication. This guide walks through the complete user journey from lead capture to job completion and review collection.

---

## The Complete Customer Lifecycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  New Lead   │───▶│  Estimate   │───▶│    Sold     │───▶│  Schedule   │───▶│  Complete   │
│   Capture   │    │   Process   │    │   & Prep    │    │  & Execute  │    │  & Review   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │                  │
   AI answers         AI follows        AI sends           AI sends           AI requests
   calls/texts        up auto          contracts          reminders          reviews
```

---

## Phase 1: Lead Capture (Speed-to-Lead)

### Scenario: Homeowner Needs Roof Repair

**3:47 AM** - Sarah's roof starts leaking during a storm. She searches "emergency roof repair Denver" and finds your website.

### What Happens:

1. **Sarah fills out web form** with her name, phone, and address

2. **Within 60 seconds**, AI Employee responds:
   ```
   SMS to Sarah:
   "Hi Sarah! Thanks for contacting ABC Roofing. I'm sorry to hear
   about your roof emergency. We're available 24/7 for situations
   like this. Can you tell me more about the leak? Is it actively
   dripping inside your home?"
   ```

3. **Sarah replies**: "Yes, it's dripping in the bedroom. Pretty bad."

4. **AI responds intelligently**:
   ```
   "I understand - that's stressful. For now, if you have a bucket
   or container, place it under the drip to catch the water.

   I'd like to get one of our technicians out there first thing
   in the morning for an emergency inspection. We have availability
   at 7:30 AM or 9:00 AM. Which works better for you?"
   ```

5. **Sarah picks 7:30 AM**

6. **AI confirms and creates the job**:
   ```
   "Perfect! I've scheduled Mike from our emergency response team
   to be at 123 Oak Street tomorrow at 7:30 AM. You'll receive a
   reminder text in the morning.

   If the leak gets worse overnight, call us at (303) 555-0100
   and press 1 for emergencies. Hang in there, Sarah!"
   ```

### Behind the Scenes (CRM):
- New customer record created for Sarah
- Job created: "Emergency Roof Repair - 123 Oak Street"
- Status: `estimate_scheduled`
- Assigned to emergency response crew
- Sarah automatically enrolled in "New Lead" sequence

---

## Phase 2: Inbound Phone Call

### Scenario: Homeowner Calls Your Business Line

**10:23 AM** - John sees your truck in his neighborhood and calls the number on the side.

### What Happens:

1. **AI answers the phone**:
   ```
   "Thanks for calling ABC Roofing! This is Alex, your AI
   assistant. I can help you schedule a free roof inspection,
   get a quote, or answer questions about our services.
   How can I help you today?"
   ```

2. **John**: "Yeah, I saw your guys working next door. My roof is
   about 15 years old and I'm thinking about replacing it before
   it becomes a problem."

3. **AI gathers qualifying info**:
   ```
   "Smart thinking! A proactive replacement can save you from
   emergency repairs down the road. Let me get some quick
   information to set up your free inspection.

   What's the address of the property?"
   ```

4. **AI continues qualifying**:
   - Property address ✓
   - Roof type (residential/commercial) ✓
   - Approximate square footage ✓
   - Current roofing material ✓
   - Any known issues ✓
   - Preferred contact method ✓

5. **AI schedules the appointment**:
   ```
   "Great! I have your inspection scheduled for Thursday at 2 PM
   at 456 Maple Drive. Our estimator Dave will be there - he's
   been with us for 12 years and knows everything about roofing
   in Colorado.

   You'll receive a confirmation text shortly, and a reminder
   the day before. Is there anything else I can help you with?"
   ```

6. **Post-call**: AI sends confirmation SMS and email with appointment details

### Behind the Scenes (CRM):
- Customer created: John Williams
- Source: `cold_call` (inbound)
- Job created: "Roof Replacement - 456 Maple Drive"
- Status: `estimate_scheduled`
- Call transcript logged
- Voice minutes tracked (3 min 24 sec used)

---

## Phase 3: Estimate Follow-Up Sequence

### Scenario: Estimate Sent, Waiting for Decision

**Day 0** - Your estimator visits Sarah, assesses the damage, and sends a $4,500 repair estimate.

### Automated Sequence Triggers:

**Day 0 (Immediate)**:
```
SMS: "Hi Sarah! Dave just sent over your repair estimate for
123 Oak Street. You can view it here: [link]. Let me know if
you have any questions - I'm happy to help explain anything!"
```

**Day 2**:
```
SMS: "Hi Sarah, just checking in on the estimate we sent.
Do you have any questions I can answer about the repair process
or warranty coverage?"
```

**Day 5** - AI makes a follow-up call:
```
"Hi Sarah, this is Alex from ABC Roofing following up on your
roof repair estimate. I wanted to make sure you received it
and see if you had any questions about the work or our
warranty program."

[If Sarah has questions, AI answers them]
[If Sarah needs more time, AI offers to check back next week]
[If Sarah is ready to proceed, AI collects deposit and schedules]
```

**Day 10** (if no response):
```
SMS: "Hi Sarah, your estimate for the roof repair at 123 Oak
Street is still valid. We have some availability opening up
next week if you're ready to move forward. Just reply or call
whenever you're ready!"
```

**Day 21** (final touch):
```
Email: Subject: "Your Roof Repair Estimate - Still Here When You're Ready"

Hi Sarah,

I wanted to reach out one more time about your roof repair
estimate. I understand these decisions take time, and I want
you to know there's no pressure.

If your situation has changed or you went with another company,
no hard feelings! But if you're still considering us, your
estimate is valid for 30 days and we'd love to help.

Best,
The ABC Roofing Team
```

### Behind the Scenes (CRM):
- Job status: `estimate_sent`
- Sequence: "Estimate Follow-Up" (active)
- Each touchpoint logged in activity feed
- SMS/call metrics tracked toward monthly limits

---

## Phase 4: Job Sold & Scheduling

### Scenario: Customer Accepts Estimate

**Sarah replies**: "Let's do it. How do we get started?"

### What Happens:

1. **AI acknowledges and collects deposit**:
   ```
   "Wonderful! I'll get your repair scheduled right away.

   To confirm your spot, we collect a $500 deposit (applied
   to your total). You can pay securely here: [payment_link]

   Once that's complete, I'll send over the available dates!"
   ```

2. **After payment, AI offers scheduling**:
   ```
   "Got it! Thank you, Sarah.

   Looking at our schedule, we have the following openings:
   • Monday, Feb 3rd (morning)
   • Wednesday, Feb 5th (all day)
   • Friday, Feb 7th (afternoon)

   Which works best for your schedule?"
   ```

3. **Sarah picks Wednesday**

4. **AI confirms with details**:
   ```
   "Perfect! Your repair is scheduled for Wednesday, Feb 5th.

   Here's what to expect:
   • Our Alpha Crew (led by Mike) will arrive between 7-8 AM
   • The repair typically takes 4-6 hours
   • Please clear your driveway if possible
   • We'll place a dumpster for debris (removed same day)

   You'll receive a reminder the day before with your crew's
   contact info. See you Wednesday!"
   ```

### Behind the Scenes (CRM):
- Job status updated: `sold` → `scheduled`
- Scheduled date: Feb 5th
- Crew assigned: Alpha Crew
- Customer enrolled in "Pre-Job" sequence
- Invoice created (deposit recorded)

---

## Phase 5: Pre-Job Communication

### Day Before Job:

**Automated reminder**:
```
SMS: "Hi Sarah! Just a reminder that our crew will be at
123 Oak Street tomorrow morning (Wed, Feb 5th) between 7-8 AM
for your roof repair.

Your crew leader is Mike: (303) 555-0199

Weather looks good ☀️ See you tomorrow!"
```

### Morning of Job:

**Crew dispatch notification**:
```
SMS: "Good morning, Sarah! Mike and the Alpha Crew are on
their way to 123 Oak Street. ETA: 7:35 AM.

They'll knock when they arrive. Have a great day!"
```

### Behind the Scenes:
- Crew receives job details via their app
- Route optimized from previous job
- Materials checklist confirmed

---

## Phase 6: Job Completion & Payment

### When Crew Marks Job Complete:

1. **AI sends completion notification**:
   ```
   SMS: "Great news, Sarah! Your roof repair is complete.
   Mike and the crew have finished up and cleaned the area.

   Your final invoice is ready: [invoice_link]
   Total: $4,500.00
   Deposit paid: -$500.00
   Balance due: $4,000.00

   You can pay online or we accept check/cash. Thanks for
   choosing ABC Roofing!"
   ```

2. **Sarah pays online** → AI sends receipt:
   ```
   "Payment received! Thank you, Sarah.

   Your receipt and warranty information have been emailed
   to you. Your 10-year workmanship warranty is now active.

   If you have any questions about your repair or notice
   anything concerning, don't hesitate to reach out. We
   stand behind our work 100%."
   ```

### Behind the Scenes (CRM):
- Job status: `complete` → `invoiced` → `paid`
- Invoice marked paid
- Warranty record created
- Customer status updated: `lead` → `customer`
- Review request sequence triggered

---

## Phase 7: Review Collection

### Day 1 After Completion:

```
SMS: "Hi Sarah! We hope you're enjoying your newly repaired
roof. If you have a moment, we'd really appreciate a quick
review - it helps other homeowners find quality roofers.

⭐ Leave a Google Review: [review_link]

Thanks again for trusting ABC Roofing!"
```

### Day 7 (if no review):

```
Email: Subject: "How did we do, Sarah?"

Hi Sarah,

It's been a week since we completed your roof repair, and
I wanted to check in. Is everything holding up well?

If you're happy with the work, we'd be grateful if you
could share your experience:

[Leave a Review Button]

Your feedback helps us improve and helps other homeowners
make informed decisions.

Thank you!
The ABC Roofing Team
```

### Behind the Scenes:
- Review request sequence tracked
- If review is posted, sequence stops automatically
- Review sentiment can trigger thank-you response

---

## Using the CRM Dashboard

### Daily Workflow:

1. **Morning Check-In** (`/crm`)
   - Review overnight leads (Speed-to-Lead handled them!)
   - Check today's scheduled jobs
   - Review usage stats (voice minutes, SMS)

2. **Pipeline Management** (`/crm/jobs`)
   - Kanban view shows all jobs by stage
   - Drag jobs to update status
   - Click to see full job details

3. **Customer Lookup** (`/crm/customers`)
   - Search by name, phone, or address
   - View complete customer history
   - Send quick SMS from detail panel

4. **Inbox Monitoring** (`/crm/inbox`)
   - See all conversations in one place
   - AI responses marked with robot icon
   - Jump in to handle complex questions

5. **Crew Scheduling** (`/crm/crews`)
   - View crew availability
   - Assign jobs based on skills and location
   - Track crew capacity

---

## Sequence Templates (Pre-Built)

### 1. New Lead Nurture
- **Trigger**: New lead created
- **Goal**: Convert lead to estimate appointment
- **Steps**: Immediate SMS → Day 1 call → Day 3 SMS → Day 7 email

### 2. Estimate Follow-Up
- **Trigger**: Estimate sent
- **Goal**: Close the sale
- **Steps**: Immediate SMS → Day 2 SMS → Day 5 call → Day 10 SMS → Day 21 email

### 3. Pre-Job Preparation
- **Trigger**: Job scheduled
- **Goal**: Ensure smooth job day
- **Steps**: Day-before reminder → Morning-of ETA update

### 4. Review Request
- **Trigger**: Job completed & paid
- **Goal**: Collect 5-star reviews
- **Steps**: Day 1 SMS → Day 7 email → Day 14 final SMS

### 5. Annual Maintenance Reminder
- **Trigger**: 11 months after job completion
- **Goal**: Generate repeat business
- **Steps**: Email offer → SMS follow-up → Call if no response

---

## Key Metrics to Track

| Metric | Target | Location |
|--------|--------|----------|
| Speed-to-Lead Response | < 60 seconds | Dashboard |
| Lead → Estimate Rate | > 40% | Jobs Pipeline |
| Estimate → Sale Rate | > 30% | Jobs Pipeline |
| Average Response Time | < 5 minutes | Inbox |
| Review Collection Rate | > 25% | Sequences |
| Voice Minutes Used | Track vs. 500/mo | Dashboard |
| SMS Messages Used | Track vs. 1000/mo | Dashboard |

---

## Tips for Success

1. **Trust the AI** - It handles 80% of routine communication. Only jump in for complex situations.

2. **Keep Customer Data Clean** - Accurate phone numbers and emails ensure messages reach customers.

3. **Customize Sequences** - Edit templates to match your brand voice and local market.

4. **Monitor the Inbox** - Check daily for conversations that need human touch.

5. **Use Tags** - Tag customers for easy filtering (e.g., "insurance-claim", "repeat-customer", "referral-source").

6. **Review Call Transcripts** - AI calls are logged. Review occasionally to ensure quality.

7. **Track Conversion Rates** - Use pipeline data to identify where leads are dropping off.

---

## Getting Started Checklist

- [ ] Add your Twilio phone number to receive calls/texts
- [ ] Configure your business hours and after-hours message
- [ ] Customize the default SMS and email templates
- [ ] Create your first crew and set their skills
- [ ] Import existing customers (or start fresh)
- [ ] Test the flow by submitting a lead yourself
- [ ] Share your Twilio number on your website and trucks

---

## Support

Questions? Contact us at support@rooftops.ai or use the in-app chat.

Your AI Employee is ready to work 24/7. Let's grow your roofing business! 🏠

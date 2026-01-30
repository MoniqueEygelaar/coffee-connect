

## Watercooler - Team Connection App

A vibrant, full-featured app that randomly pairs team members for weekly watercooler chats based on their overlapping availability.

---

### Page 1: Landing / Sign Up Page
A welcoming, colorful landing page where new team members can sign up:
- Fun hero section with coffee/chat illustrations and warm greeting
- Simple sign-up form: name + email
- Clear call-to-action to join the watercooler

---

### Page 2: Availability Selection
After signing up, users select when they're free for coffee chats:
- Interactive weekly calendar grid (Monday-Friday, 9 AM - 5 PM)
- Click/tap to toggle time slots on or off
- Visual feedback showing selected slots
- Save button to confirm availability
- "Thank you" confirmation message explaining they'll be matched weekly

---

### Page 3: Admin Dashboard
A management hub for admins to oversee the watercooler program:
- **User Management**: View all registered team members, their emails, and availability at a glance
- **Manual Matching Trigger**: Button to run the weekly pairing algorithm on-demand
- **Match History**: Log of all past pairings showing who was matched, when, and what time slot they shared
- **Stats Overview**: Number of participants, successful matches, participation rate

---

### Matching System (Backend)
Automated weekly pairing that runs behind the scenes:
- Finds pairs of users with overlapping available time slots
- Randomly pairs users, ensuring variety (avoids recent repeat pairings when possible)
- Sends email notifications to matched pairs with:
  - Their partner's name and email
  - The shared available time slot suggestion
  - A friendly message encouraging connection

---

### Design Style: Fun & Colorful
- Bright, welcoming color palette (warm oranges, teals, friendly purples)
- Playful illustrations or icons (coffee cups, chat bubbles, people)
- Rounded corners and soft shadows for approachability
- Micro-animations for delightful interactions

---

### Technical Requirements
- **Backend needed**: Yes - for storing users, availability, match history, and running the matching algorithm
- **Email integration**: Will use Resend for sending match notification emails
- **Database tables**: Users, Availability Slots, Match History


# Ikuttes MVP Development Checklist

This checklist outlines all the critical tasks and deliverables for the MVP, broken down by phase.

**Last Updated:** April 23, 2025

---

## 🔧 Phase 1: Setup & Core Infrastructure

- [x] Initialize Next.js project
- [ ] Setup HeroUI and basic layout templates *(Note: Using TailwindCSS instead)*
- [x] Integrate Firebase Auth (email + Google sign-in)
- [x] Setup Firestore database structure
- [x] Define collections: `users`, `quizzes`, `results`, `news`, `personality_tests`
- [x] Setup routing and global navigation (Home, Quizzes, Profile, News)

**Progress Notes (April 23):**
- Fixed Firebase configuration to use environment variables in `.env.local`
- Implemented singleton pattern for Firebase initialization to prevent duplicate app creation
- Fixed invalid `<Link>` usage in register.js

---

## 🧠 Phase 2: Quiz Engine

### Full Exam Tryout
- [x] Build quiz interface (questions, timer, navigation)
- [x] Create result summary with score breakdown
- [x] Store attempt data in Firestore
- [x] Add explanations to question data
- [x] Allow user to review incorrect answers

### Quick Quizzes (3 Questions)
- [x] Separate flow for short quizzes
- [x] Random selection by topic
- [x] Display immediate feedback after each question

**Progress Notes (April 23):**
- Implemented full exam tryout page with 10 sample questions and 30-minute timer
- Created short quiz page with topic selection (TWK, TIU, TKP) and random question selection
- Enhanced Quiz component with explanations, immediate feedback, and review mode
- Added localStorage fallback for Firestore operations when permissions are insufficient
- Configured short quizzes to not save results (practice only) while full tryouts save results

---

## 💡 Phase 3: Personality Test

- [ ] Define question set and result types (8–12 Qs)
- [ ] Build test UI (one-question-at-a-time flow)
- [ ] Calculate personality result
- [ ] Store result to `user` document in Firebase
- [ ] Display suggestions based on personality type

---

## 🔍 Phase 4: News Feed via Gemini + Firebase

- [ ] Setup Gemini API credentials and access
- [ ] Define prompts to fetch and summarize relevant news
- [ ] Schedule daily summary task (Cloud Function or cron)
- [ ] Parse and store summarized news to Firestore `news` collection
- [ ] Build UI to display latest 5–10 news updates
- [ ] Highlight upcoming registration deadlines

---

## 📊 Phase 5: Profile & Progress

- [x] Create Profile page layout
- [x] Display latest quiz results and scores
- [x] Visualize score trends by topic or test type
- [ ] Show stored personality test result
- [x] Track completed quizzes and attempts

**Progress Notes (April 23):**
- Updated Profile page to fetch quiz history from Firestore instead of localStorage
- Added statistics visualization with total attempts, average score, and best score
- Implemented performance tracking by quiz type with visual progress bars
- Added fallback to localStorage when Firestore operations fail due to permissions

---

## 🔔 Phase 6: Reminders & Deadline Tracking

- [ ] Create static Firebase collection for exam dates
- [ ] UI for users to tap “Remind Me”
- [ ] Optional: Setup Firebase Cloud Messaging
- [ ] Send push/email reminder for upcoming deadlines

---

## 🏆 Phase 7: Leaderboard

- [x] Create leaderboard collection or derive from quiz data
- [x] Sort users by average score or total points
- [ ] Filter by exam type
- [ ] Allow anonymous display (optional)

**Progress Notes (April 23):**
- Implemented basic leaderboard functionality
- Added localStorage fallback for leaderboard data when Firestore permissions are insufficient

---

## 🎯 Phase 8: QA & Soft Launch

- [x] Test all quiz flows (edge cases, invalid answers)
- [ ] Test personality test logic and display
- [ ] Validate news fetch + store jobs
- [ ] QA reminder flow and schedule
- [ ] Test across devices (desktop, mobile, PWA)
- [ ] Collect user feedback (survey or Google Form)
- [x] Prep changelog and known issues list

**Progress Notes (April 23):**
- Identified and fixed Firebase permission issues with localStorage fallback
- Added error handling to prevent app crashes
- Tested quiz flows with both full tryout and short quiz options

---

## 🛠 Post-MVP Prep

- [ ] MCP-based dynamic quiz generation planning
- [ ] Schema for AI-generated lessons
- [ ] Admin dashboard (optional future)
- [ ] A/B test “Learn Before Quiz” flow

---

## 📝 Next Steps (For Tomorrow)

1. **Firebase Security Rules**: Configure proper Firestore security rules to allow authenticated users to read/write appropriate collections
2. **Personality Test Implementation**: Begin work on Phase 3 (Personality Test)
3. **News Feed**: Start implementation of Phase 4 (News Feed via Gemini)
4. **UI Polish**: Improve overall UI/UX and ensure consistent styling across all pages
5. **Testing**: Comprehensive testing across different devices and browsers

---

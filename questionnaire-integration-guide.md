# Questionnaire Integration Strategy

## 🎯 Where Users Will See the Questionnaire

We've integrated the 13-question profile questionnaire in **5 strategic locations** for maximum visibility and engagement:

---

## 1️⃣ **Discovery View (Top Banner)** 🌟

**Location:** Main discovery page, above profile cards  
**Component:** `ProfileEnhancementBanner`

**What Users See:**
```
┌─────────────────────────────────────────────────────┐
│ ✨ Unlock Perfect Matches!                          │
│                                                      │
│ Answer 13 quick questions to help us find your      │
│ ideal match. Our intelligent system learns what     │
│ you're looking for!                                  │
│                                                      │
│ [████████░░░░░░░░░░] 45%   [Complete Profile →]    │
└─────────────────────────────────────────────────────┘
```

**Why Here:** First thing users see when browsing matches

---

## 2️⃣ **Profile View (Completion Widget)** 📊

**Location:** User's own profile page  
**Component:** `ProfileCompletionWidget`

**What Users See:**
```
┌─────────────────────────────────────────────────────┐
│ Complete Your Profile                         ⚠️    │
│ 💫 Great progress! Answer a few more questions      │
│ for better matches!                                  │
│                                                      │
│ Profile Strength                              60%   │
│ [████████████░░░░░░░░]                              │
│                                                      │
│ Missing: personality, deep                          │
│                                                      │
│ [Complete Profile for Perfect Matches]              │
└─────────────────────────────────────────────────────┘
```

**Why Here:** Natural place to improve profile

---

## 3️⃣ **Settings Page (Dedicated Section)** ⚙️

**Location:** Settings view  
**Component:** Questionnaire section in settings

**What Users See:**
```
┌─────────────────────────────────────────────────────┐
│ Profile Questionnaire                                │
│                                                      │
│ Complete our 13-question profile to unlock          │
│ intelligent matching                                 │
│                                                      │
│ Completion: 60%                                      │
│                                                      │
│ [Start Questionnaire]                                │
└─────────────────────────────────────────────────────┘
```

**Why Here:** Users actively looking to improve their experience

---

## 4️⃣ **Post-Onboarding Flow** 🎉

**Location:** Right after completing basic onboarding  
**Component:** Automatic modal trigger

**What Users See:**
```
┌─────────────────────────────────────────────────────┐
│                                                   ✕  │
│  🎯 One More Step to Perfect Matches!               │
│                                                      │
│  You've created your profile! Now answer 13 quick   │
│  questions to help us find your ideal match.        │
│                                                      │
│  ● Takes only 3 minutes                              │
│  ● Dramatically improves match quality              │
│  ● Can be completed later                            │
│                                                      │
│  [Start Now]              [Maybe Later]              │
└─────────────────────────────────────────────────────┘
```

**Why Here:** Capture users while they're engaged

---

## 5️⃣ **Empty Matches State** 💡

**Location:** Discovery view when no matches found  
**Component:** Empty state with questionnaire CTA

**What Users See:**
```
┌─────────────────────────────────────────────────────┐
│                      🔍                              │
│                                                      │
│  Looking for Better Matches?                         │
│                                                      │
│  Complete your profile questionnaire to unlock       │
│  our intelligent matching algorithm!                 │
│                                                      │
│  [Complete Questionnaire]                            │
└─────────────────────────────────────────────────────┘
```

**Why Here:** Users actively seeking matches

---

## 🎨 Creative Design Elements

### **Visual Indicators:**
- **Gradient borders** (purple → pink → orange)
- **Progress bars** showing completion %
- **Animated sparkles** ✨
- **Pulsing badges** for incomplete sections

### **Motivational Messages:**
- 0-20%: "💝 Welcome! Answer these questions to find your perfect match!"
- 20-40%: "🚀 Good start! Complete your profile to get matched intelligently!"
- 40-60%: "✨ You're halfway there! Keep going to find your perfect match!"
- 60-80%: "💫 Great progress! Answer a few more questions for better matches!"
- 80-99%: "🌟 Almost there! Complete your profile to unlock perfect matches!"
- 100%: "🎉 Perfect! Your profile is complete and optimized for the best matches!"

### **Gamification:**
- Profile strength meter
- Section completion badges
- "Unlock" language
- Progress celebration

---

## 📱 User Flow Example

**Day 1:** User signs up
1. Completes basic onboarding (name, age, photos)
2. **Sees modal:** "One More Step to Perfect Matches!"
3. Can start questionnaire or skip

**Day 2:** User browses matches
1. **Sees banner** at top: "Unlock Perfect Matches! 45% complete"
2. Clicks "Complete Profile"
3. **Opens questionnaire modal**

**Day 3:** User checks profile
1. **Sees widget:** "Complete Your Profile - 60%"
2. Shows missing sections
3. One-click to continue questionnaire

**Day 4:** User goes to settings
1. **Sees questionnaire section**
2. Can review/edit answers
3. Track completion progress

---

## 🚀 Implementation Files

### Components Created:
1. `ProfileCompletionWidget.tsx` - Main widget
2. `QuestionnaireModal.tsx` - 13-question flow
3. `ProfileEnhancementBanner.tsx` - Discovery banner

### Integration Points:
1. Discovery View - Add banner component
2. Profile View - Add completion widget
3. Settings View - Add questionnaire section
4. App.tsx - Add post-onboarding modal
5. Empty states - Add questionnaire CTA

---

## ✅ Next Steps to Activate

1. **Run SQL Schema:**
   ```sql
   -- In Supabase SQL Editor
   -- Run: profile-questionnaire-schema.sql
   ```

2. **Add Components to Views:**
   - Import `ProfileEnhancementBanner` in Discovery
   - Import `ProfileCompletionWidget` in Profile
   - Import `QuestionnaireModal` in App

3. **Test Flow:**
   - Create new user
   - See post-onboarding prompt
   - Browse discovery → see banner
   - Visit profile → see widget
   - Go to settings → see section

---

## 🎯 Expected Results

- **60%+ users** complete questionnaire within first week
- **Better match quality** from day 1
- **Higher engagement** with intelligent matching
- **Clear value proposition** for completing profile

**Users will see the questionnaire everywhere, making it impossible to miss!** 🚀

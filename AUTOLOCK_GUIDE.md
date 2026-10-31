# 🔒 Auto-Lock Feature - Security Timeout

Your RATL Dashboard now includes **automatic session locking** after 5 minutes of inactivity to protect your account.

## ⏱️ How It Works

1. **5-Minute Timer** - Starts when you log in
2. **Activity Detection** - Timer resets on:
   - Mouse movement
   - Keyboard input
   - Clicking
   - Scrolling
   - Touching (mobile)

3. **Warning at 4.5 Minutes** - Get notified before lock
4. **Auto-Lock** - Session locks after exactly 5 minutes
5. **Unlock Required** - Enter password to continue

## 🎯 Features

### ⏲️ Inactivity Tracking
- Monitors all user interactions
- Automatically resets on activity
- Shows countdown warning

### ⚠️ Pre-Lock Warning
- Warning appears at 4:30 remaining
- Shows countdown timer
- Located in bottom-right corner
- Can be dismissed

### 🔐 Lock Screen
- Full-screen lock overlay
- Requires original password to unlock
- Shows current user
- Secure and protected

### 🟢 Always Connected
- Lock doesn't disconnect you
- Your session remains active while locked
- Quick unlock without re-login

## 🎮 User Experience

### Before Lock (4:30 Timer)
```
Status: 🟡 Warning (Bottom-right notification)
Message: "Your session will be locked in 30 seconds due to inactivity"
Progress bar counting down
Option to dismiss warning
```

### After Lock
```
Status: 🔴 Locked
Screen: Full overlay with lock icon
Action Required: Enter password to unlock
```

### After Unlock
```
Status: 🟢 Active
Timer: Reset to 5 minutes
User can continue working
```

## 📱 Activity Events That Keep Session Active

Any of these actions will reset the 5-minute timer:

- ✓ Mouse movement
- ✓ Mouse click
- ✓ Keyboard press
- ✓ Page scroll
- ✓ Touch screen (mobile)
- ✓ Text input

## 🚫 What Doesn't Keep It Active

These don't count as activity:
- ✗ Just reading the page
- ✗ Video/audio playing
- ✗ Network requests in background
- ✗ Automatic page updates

## 🔑 Unlocking Your Session

1. **Lock Screen appears** - Shows your username
2. **Enter password** - Type your login password
3. **Click Unlock** - Button becomes active when password entered
4. **Error handling** - Wrong password shows error message

**Password is same as login credentials**
- Username: HUSSAM
- Password: 2026

## ⚙️ Configuration (Optional)

To change the timeout duration, edit `src/hooks/useInactivityTimeout.ts`:

```typescript
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;  // ← Change this (milliseconds)
const WARNING_TIME = 4.5 * 60 * 1000;      // ← And this
```

### Examples

```typescript
// 3 minutes
const INACTIVITY_TIMEOUT = 3 * 60 * 1000;
const WARNING_TIME = 2.5 * 60 * 1000;

// 10 minutes
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;
const WARNING_TIME = 9.5 * 60 * 1000;

// 1 minute (testing)
const INACTIVITY_TIMEOUT = 60 * 1000;
const WARNING_TIME = 30 * 1000;
```

## 🧪 Testing the Feature

### Test Inactivity Lock
1. Log in to dashboard
2. Don't move mouse or press keys
3. Wait 4:30 → See warning notification
4. Wait 30 more seconds → Screen locks

### Test Quick Unlock
1. Locked screen appears
2. Enter password: `2026`
3. Click "Unlock Session"
4. Dashboard becomes active again
5. Timer resets to 5 minutes

### Test Activity Reset
1. Warning appears at 4:30
2. Move mouse or click
3. Warning disappears
4. Timer resets to 5:00

## 🛡️ Security Benefits

- **Prevents unauthorized access** when you step away
- **Protects sensitive data** from shoulder surfers
- **Automatic protection** - no manual action needed
- **Clear visual feedback** - always know your status

## 📊 Status Indicators

### Top of Dashboard (If you add CollaborationStatus)
- 🟢 Live = Active & Synced
- 🟡 Orange dot + warning = Activity warning
- 🔴 Red/Locked icon = Session locked

### Lock Screen
- Lock icon = Session is secured
- User name displayed = Your session
- Password field = Enter to unlock

## 🔒 Lock Screen Details

What you see when locked:

```
┌─────────────────────┐
│        🔐           │
│                     │
│   Session Locked    │
│  [explanation]      │
│                     │
│  Logged in as:      │
│      HUSSAM         │
│                     │
│  Password: [input]  │
│                     │
│ [Unlock Session]    │
│                     │
│  Secured session    │
│  Auto-locks after   │
│  5 min of no use    │
└─────────────────────┘
```

## ❓ FAQ

**Q: Can I turn off auto-lock?**
A: Not currently - it's always active for security. You can change the timeout duration.

**Q: Will I lose my work?**
A: No! Your session stays active while locked. Unlocking resumes immediately.

**Q: What if I forget my password?**
A: You cannot unlock - must log out via url navigation or browser reset.

**Q: Does lock work offline?**
A: Yes! Inactivity timeout works without internet connection.

**Q: Multiple devices - do all lock together?**
A: No, each device has independent inactivity timers.

**Q: Can I dismiss the warning?**
A: Yes, click dismiss, but you'll still lock after 30 seconds.

## 🚀 Deployment Notes

This feature works:
- ✅ Localhost development
- ✅ Local network (LAN)
- ✅ Cloud deployment
- ✅ All browsers
- ✅ Mobile & tablet

No special configuration needed for production.

## 📝 Logs & Monitoring

Interactions logged (if you add logging):
- User locked due to inactivity
- User viewed timeout warning
- User unlocked session
- Failed unlock attempts

---

**Security is automatic** - Your dashboard protects itself! 🔐

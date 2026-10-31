# Real-Time Notification & Message Synchronization System

This guide explains the new real-time notification and message synchronization features added to the Next.js admin dashboard.

## Features

### 1. **Real-Time Notifications**
- Toast-style notifications that appear in the top-right corner
- Multiple notification types: success, error, warning, info
- Auto-dismiss success notifications after 5 seconds
- Persistent critical notifications until dismissed by user
- Unread notification badge in the header

### 2. **Message Synchronization Across Devices**
- Synchronized messages between mobile and desktop devices
- Device tracking with unique device IDs
- Automatic device detection when coming online
- Message history sync when switching devices

### 3. **Dual Sync Mechanism**
- **WebSocket**: Real-time bidirectional communication
- **REST API Polling**: Fallback for mobile app integration

## File Structure

### New Files Created:

```
src/
├── context/
│   └── NotificationContext.tsx         # Notification state management
├── components/
│   ├── NotificationCenter.tsx          # Toast notification display
│   ├── NotificationBell.tsx            # Header notification bell with dropdown
│   ├── MessageSyncInitializer.tsx      # WebSocket sync initialization
│   └── NotificationPollerInitializer.tsx # API polling initialization
├── hooks/
│   ├── useMessageSync.ts               # WebSocket message sync hook
│   └── useNotificationPoller.ts        # REST API polling hook
└── app/
    └── api/
        └── notifications/
            └── route.ts                # API endpoint for notifications
```

### Modified Files:

- `src/app/layout.tsx` - Added providers and initializers
- `src/layout/AppHeader.tsx` - Added NotificationBell component
- `src/utils/websocket.ts` - Enhanced with support for new message types

## Usage

### For Desktop/Web Client

Notifications are automatically initialized. Import and use the `useNotification` hook:

```tsx
import { useNotification } from "@/context/NotificationContext";

export function MyComponent() {
  const { addNotification } = useNotification();

  const handleAction = () => {
    addNotification({
      title: "Success",
      message: "Action completed successfully",
      type: "success"
    });
  };

  return <button onClick={handleAction}>Perform Action</button>;
}
```

### For Mobile App

Send notifications via the REST API endpoint:

```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message-received",
    "title": "New Message",
    "message": "You have a new message from John",
    "deviceSource": "mobile",
    "payload": {
      "userId": "user123",
      "userName": "John",
      "message": "Hi there!"
    }
  }'
```

### Notification Types

```typescript
type: "success" | "error" | "info" | "warning"
deviceSource: "mobile" | "desktop" | any string
```

## How It Works

### WebSocket Flow

1. **Connection**: When the app loads, `MessageSyncInitializer` establishes a WebSocket connection
2. **Device Registration**: Sends unique device ID to notify other devices
3. **Message Sync**: Any message added via `addMessage()` is broadcast to all connected devices
4. **Auto-Sync**: New devices request message history from existing connected devices

### REST API Flow

1. **Polling**: `NotificationPollerInitializer` polls `/api/notifications` every 5 seconds
2. **Queue**: Mobile app sends notifications via POST to the API
3. **Retrieval**: Web app fetches pending notifications and displays them
4. **Cleanup**: Queue is cleared after retrieval

## API Reference

### POST /api/notifications

Send a notification from mobile device:

```typescript
interface NotificationPayload {
  type: "message-sync" | "message-received" | "device-sync" | string;
  title: string;
  message: string;
  deviceSource?: string;
  payload?: any;
}
```

Response:
```typescript
{
  success: true,
  notification: { /* the notification object */ },
  message: "Notification received"
}
```

### GET /api/notifications

Retrieve pending notifications:

```typescript
Response: {
  notifications: Notification[],
  count: number
}
```

## Hooks

### useNotification()

```typescript
const {
  notifications,           // Array of all notifications
  addNotification,         // (config) => string (returns notification ID)
  removeNotification,      // (id) => void
  markAsRead,             // (id) => void
  clearReadNotifications, // () => void
  getUnreadCount         // () => number
} = useNotification();
```

### useMessageSync()

```typescript
const {
  syncMessage,           // (message) => void - Send message to other devices
  deviceId              // string - Unique device ID
} = useMessageSync();
```

### useNotificationPoller()

Automatically initialized in the layout. Polls for new notifications:

```typescript
useNotificationPoller(); // Called automatically
```

## Environment Configuration

No additional environment variables needed. The system uses default WebSocket URL:

```
NEXT_PUBLIC_COLLAB_WS_URL=ws://localhost:8080
```

To customize, set in your `.env.local` file.

## Architecture Diagram

```
Mobile App           Dashboard (Web)
    |                    |
    |  REST API          |
    +---> /api/notifications
    |                    |
    |     WebSocket      |
    +<===================+
    |  message-sync      |
    |  device-online     |
    |  device-sync-req   |
    |                    |
```

## Best Practices

1. **Always use unique device IDs** - Helps track device sources
2. **Use appropriate notification types** - Improves UX
3. **Keep messages short** - Notifications display in limited space
4. **Test with WebSocket server** - Start ws-server.js in development
5. **Handle offline scenarios** - System retries connections automatically

## Troubleshooting

### Notifications not appearing?

1. Check if `NotificationProvider` is in layout
2. Verify `NotificationCenter` component is rendered
3. Check browser console for WebSocket errors
4. Ensure WebSocket server is running (if using WebSocket sync)

### Messages not syncing?

1. Verify WebSocket connection with browser DevTools
2. Check if `MessageSyncInitializer` is running
3. Review device IDs in localStorage
4. Check for CORS issues with REST API

### Performance issues?

1. Increase polling interval in `useNotificationPoller` (currently 5 sec)
2. Limit notification history shown
3. Clear old notifications regularly

## Future Enhancements

- [ ] Database persistence for notifications
- [ ] User preferences for notification types
- [ ] Sound/visual alerts
- [ ] Notification history/archive
- [ ] Push notifications integration
- [ ] End-to-end encryption for messages
- [ ] Notification grouping
- [ ] Custom notification templates

## License

Same as the main project.

# 🚀 Quick Start: Clerk + Supabase API

Get your trips API running in **5 minutes**.

## ✅ Prerequisites

- ✓ Clerk account with keys in `.env.local`
- ✓ Supabase project with keys in `.env.local`
- ✓ Next.js project running (`npm run dev`)

## 📋 Step-by-Step Setup

### 1️⃣ Create Database Table (2 minutes)

1. Open [Supabase Dashboard](https://app.supabase.com/)
2. Go to **SQL Editor** → **New Query**
3. Copy & paste this:

```sql
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
```

4. Click **Run** ✅

> **Full SQL migration available:** See `lib/supabase-setup.sql` for RLS policies & triggers

### 2️⃣ Test the API (1 minute)

**Option A: Using Browser DevTools**

1. Open your app in browser
2. Make sure you're signed in with Clerk
3. Open DevTools → Console
4. Paste this:

```javascript
// Create a trip
await fetch('/api/trips', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destination: 'Paris, France',
    start_date: '2025-06-01',
    end_date: '2025-06-10',
    description: 'Summer vacation'
  })
}).then(r => r.json()).then(console.log);

// Get all trips
await fetch('/api/trips').then(r => r.json()).then(console.log);
```

**Option B: Add React Component to a Page**

Add this to any page in your app (e.g., `app/test/page.tsx`):

```typescript
import { TripsDemo } from '@/app/components/TripsDemo';

export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <TripsDemo />
    </div>
  );
}
```

Then visit: `http://localhost:3000/test`

### 3️⃣ Verify Everything Works ✨

Check these boxes:

- [ ] ✅ Created a trip successfully
- [ ] ✅ Trip appears in the list
- [ ] ✅ Created another trip
- [ ] ✅ Both trips show up
- [ ] ✅ Trips are only visible when logged in

## 🎉 You're Done!

Your Clerk + Supabase integration is working!

## 📁 What Was Created

```
✅ app/api/trips/route.ts          - API endpoints (GET & POST)
✅ app/components/TripsDemo.tsx    - React component for testing
✅ app/types/trips.ts              - TypeScript types & validators
✅ lib/supabase-setup.sql          - Full database migration
✅ documentation/trips-api-example.md  - Complete API documentation
✅ documentation/TRIPS_API_README.md   - Comprehensive guide
```

## 🔐 How It Works

```
User Request
    ↓
Clerk Middleware (validates session)
    ↓
API Route (/api/trips)
    ↓
auth() - Get Clerk userId
    ↓
Supabase Query (filtered by userId)
    ↓
Return user's trips only
```

**Key Security:** Every query filters by `user_id = userId` from Clerk, ensuring users only see their own data.

## 🧪 Test Scenarios

### ✅ Test 1: Create Trip
```bash
POST /api/trips
Body: { destination, start_date, end_date, description }
Expected: 201 Created
```

### ✅ Test 2: List Trips
```bash
GET /api/trips
Expected: 200 OK with array of trips
```

### ✅ Test 3: Unauthorized Access
```bash
# Sign out from Clerk
GET /api/trips
Expected: 401 Unauthorized
```

### ✅ Test 4: Invalid Data
```bash
POST /api/trips
Body: { destination: "Paris" }  # Missing dates
Expected: 400 Bad Request
```

## 🔧 Extend the API

### Add Update Endpoint

Create `app/api/trips/[id]/route.ts`:

```typescript
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  
  const { data, error } = await supabaseAdmin
    .from('trips')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single();

  return Response.json({ success: true, trip: data });
}
```

### Add Delete Endpoint

```typescript
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await supabaseAdmin
    .from('trips')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId);

  return Response.json({ success: true });
}
```

## 💡 Common Issues

### "Unauthorized" Error
- Make sure you're signed in
- Check Clerk keys in `.env.local`

### "relation 'trips' does not exist"
- Run the SQL migration in Supabase

### "Cannot read properties of undefined"
- Restart your dev server: `npm run dev`

## 📚 Full Documentation

- **Complete Guide:** See `documentation/TRIPS_API_README.md`
- **API Reference:** See `documentation/trips-api-example.md`
- **Database Setup:** See `lib/supabase-setup.sql`

## 🎯 Next Steps

Now that you have this working, you can:

1. **Replicate for other resources** (bookings, favorites, etc.)
2. **Add more fields** to the trips table
3. **Build a full trip planner** UI
4. **Add image uploads** with Supabase Storage
5. **Implement search & filtering**

Happy coding! 🚀


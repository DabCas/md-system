# Setup Teacher Account After First Login

After you sign in with Google for the first time, follow these steps:

## Step 1: Sign in with Google
1. Go to: http://localhost:3000/login
2. Click "Sign in with Google"
3. Complete the Google OAuth flow

## Step 2: Get Your User ID
After signing in, run this query in Supabase SQL Editor to find your user ID:

```sql
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 1;
```

Copy the `id` field (it will be a UUID like `123e4567-e89b-12d3-a456-426614174000`)

## Step 3: Create User Record
Replace `YOUR_USER_ID` and `YOUR_EMAIL` with your actual values:

```sql
-- Insert into users table
INSERT INTO users (id, email, role, full_name)
VALUES (
  'YOUR_USER_ID',
  'YOUR_EMAIL',
  'teacher',
  'Your Full Name'
);
```

## Step 4: Create Teacher Record
Replace `YOUR_USER_ID` with the same ID:

```sql
-- Insert into teachers table
INSERT INTO teachers (user_id, name)
VALUES (
  'YOUR_USER_ID',
  'Your Full Name'
);
```

## Step 5: Test the Dashboard
1. Refresh the page: http://localhost:3000/dashboard
2. You should now see the Teacher Dashboard!

---

## Quick Copy-Paste (Update the values!)

```sql
-- Example - REPLACE THESE VALUES!
INSERT INTO users (id, email, role, full_name)
VALUES (
  'YOUR_USER_ID_HERE',
  'your.email@gmail.com',
  'teacher',
  'Teacher Name'
);

INSERT INTO teachers (user_id, name)
VALUES (
  'YOUR_USER_ID_HERE',
  'Teacher Name'
);
```

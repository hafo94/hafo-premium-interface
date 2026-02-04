

# Fix TMDB Authentication Issue

## Problem Analysis

The edge function is receiving a 401 error from TMDB with `status_code: 7` ("Invalid API key"). Despite providing the correct API Read Access Token, the authentication is failing.

After investigating, I found that TMDB supports two authentication methods:
1. **Bearer Token** (v4): Uses the "API Read Access Token" in the Authorization header
2. **API Key Query Parameter** (v3): Uses the shorter "API Key" as a URL parameter

The current code only supports the Bearer token method. Since you have both keys, I'll update the code to support **both methods** and add better error handling.

## Solution

Update the edge function to:
1. Support both `TMDB_API_KEY` (the short v3 API key) and `TMDB_ACCESS_TOKEN` (the long v4 token)
2. Use the v3 API key as a query parameter (more reliable, widely used)
3. Add better logging to debug any future issues

## Changes Required

### 1. Update Edge Function (`supabase/functions/tmdb/index.ts`)

Modify the authentication to use the **API Key as a query parameter** instead of Bearer token:

```typescript
// Change from:
const response = await fetch(tmdbUrl, {
  headers: {
    'Authorization': `Bearer ${TMDB_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Change to:
const separator = tmdbUrl.includes('?') ? '&' : '?';
const urlWithKey = `${tmdbUrl}${separator}api_key=${TMDB_API_KEY}`;

const response = await fetch(urlWithKey, {
  headers: {
    'Content-Type': 'application/json',
  },
});
```

This uses the v3 API Key authentication method, which is:
- More widely used and documented
- Simpler (no Bearer token formatting issues)
- Works with the shorter API Key you mentioned having

### 2. Add a New Secret

You'll need to add your **shorter API Key (v3)** as the `TMDB_API_KEY` secret, replacing the current token.

The short API Key looks like: `a1b2c3d4e5f6g7h8i9j0...` (32 characters, alphanumeric)

## Why This Approach?

- The v3 API Key method is the most common and reliable
- No risk of token encoding issues in the Authorization header
- Simpler debugging (the key is visible in the URL during development)
- Most TMDB examples and libraries use this method

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/tmdb/index.ts` | Switch from Bearer token to API key query parameter |


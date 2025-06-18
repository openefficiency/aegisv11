# 🔑 VAPI API Key Setup Guide

## Step 1: Get Your VAPI API Key

1. **Visit VAPI Dashboard**
   - Go to [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
   - Sign in to your account

2. **Navigate to API Keys**
   - Look for "API Keys", "Settings", or "Developer" section
   - Find your API key (usually starts with `sk-` or similar)

3. **Copy Your API Key**
   - Copy the full API key
   - ⚠️ **Keep it secure** - never share publicly!

## Step 2: Configure Your Environment

### Option A: Automated Setup (Recommended)
\`\`\`bash
# Run the interactive setup script
node scripts/setup-vapi-api-key.js
\`\`\`

### Option B: Manual Setup
1. Create or edit `.env.local` file in your project root
2. Add your VAPI API key:
\`\`\`bash
# VAPI Configuration
VAPI_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=d63127d5-8ec7-4ed7-949a-1942ee4a3917
VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063
\`\`\`

## Step 3: Validate Setup

\`\`\`bash
# Test your VAPI configuration
node scripts/validate-vapi-setup.js
\`\`\`

## Step 4: Test Integration

\`\`\`bash
# Start development server
npm run dev

# Visit test page
# http://localhost:3000/test-voice
\`\`\`

## Troubleshooting

### ❌ "Invalid API Key" Error
- Double-check your API key from VAPI dashboard
- Ensure no extra spaces or characters
- Verify the key hasn't expired

### ❌ "Assistant Not Found" Error
- Verify your Assistant ID is correct
- Check if the assistant exists in your VAPI dashboard

### ❌ "Access Forbidden" Error
- Check your VAPI account permissions
- Ensure your API key has the necessary scopes

## Security Best Practices

✅ **DO:**
- Keep API keys in `.env.local` (never commit to git)
- Use environment variables in production
- Rotate API keys regularly

❌ **DON'T:**
- Share API keys publicly
- Commit `.env.local` to version control
- Use API keys in client-side code

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VAPI_API_KEY` | Your private VAPI API key | `sk-...` |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Your VAPI assistant ID | `d63127d5-...` |
| `VAPI_SHARE_KEY` | Your VAPI share key | `5d2ff1e9-...` |

## Next Steps

Once your VAPI API key is configured:

1. ✅ Run validation script
2. ✅ Test locally with `npm run dev`
3. ✅ Deploy to Vercel
4. ✅ Set environment variables in Vercel dashboard
5. ✅ Test production deployment

---

Need help? Check the [VAPI Documentation](https://docs.vapi.ai) or run the validation script for detailed error messages.

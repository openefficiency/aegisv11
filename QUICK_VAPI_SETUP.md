# 🚀 Quick VAPI Setup Guide

## Step 1: Create Environment File

\`\`\`bash
node scripts/create-env-file.js
\`\`\`

This creates a `.env.local` file with all the necessary variables.

## Step 2: Get Your VAPI API Key

1. Go to [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Sign in to your account
3. Find your API Key (usually in Settings or API Keys section)
4. Copy the API key (starts with something like `sk-` or similar)

## Step 3: Update .env.local File

1. Open the `.env.local` file in your project root
2. Find this line:
   \`\`\`
   VAPI_API_KEY=your_vapi_api_key_here
   \`\`\`
3. Replace `your_vapi_api_key_here` with your actual API key:
   \`\`\`
   VAPI_API_KEY=sk-your-actual-api-key-here
   \`\`\`
4. Save the file

## Step 4: Verify Configuration

\`\`\`bash
node scripts/check-vapi-config.js
\`\`\`

## Step 5: Test the Integration

\`\`\`bash
# Start development server
npm run dev

# Open browser and go to:
# http://localhost:3000/test-voice
\`\`\`

## Step 6: Deploy

Once everything works locally:

1. Push your code to GitHub (`.env.local` won't be pushed - it's in .gitignore)
2. In Vercel dashboard, add these environment variables:
   - `VAPI_API_KEY` = your actual API key
   - `NEXT_PUBLIC_VAPI_ASSISTANT_ID` = d63127d5-8ec7-4ed7-949a-1942ee4a3917
   - `VAPI_SHARE_KEY` = 5d2ff1e9-46b9-4b45-8369-e6f0c65cb063
3. Deploy!

## Troubleshooting

### ❌ "API Key Invalid"
- Double-check you copied the full API key
- Make sure there are no extra spaces
- Verify the key is active in your VAPI dashboard

### ❌ "Assistant Not Found"
- The assistant ID should be: `d63127d5-8ec7-4ed7-949a-1942ee4a3917`
- Don't change this value

### ❌ Voice widget not loading
- Check browser console for errors
- Verify all environment variables are set
- Make sure you're using HTTPS in production

## Your VAPI Configuration

- **Assistant ID**: `d63127d5-8ec7-4ed7-949a-1942ee4a3917`
- **Share Key**: `5d2ff1e9-46b9-4b45-8369-e6f0c65cb063`
- **API Key**: [You need to add this from your VAPI dashboard]

---

**Need help?** Run `node scripts/check-vapi-config.js` for detailed status.

# VAPI Integration Guide

## 🎯 Overview
This guide explains how to integrate VAPI (Voice AI Platform) with the Aegis Whistle Platform for voice-based reporting.

## 🔧 Environment Setup

### Required Environment Variables
\`\`\`bash
# Public variables (safe for client-side)
NEXT_PUBLIC_VAPI_ASSISTANT_ID=d63127d5-8ec7-4ed7-949a-1942ee4a3917

# Private variables (server-side only)
VAPI_API_KEY=your_vapi_api_key_here
VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063
\`\`\`

### Quick Setup
Run the setup script to configure environment variables:
\`\`\`bash
node scripts/setup-vapi-environment.js
\`\`\`

## 🎤 VAPI Integration Features

### 1. Voice Widget Component
- **Location**: `components/vapi-voice-widget.tsx`
- **Features**: 
  - Secure iframe integration
  - Popup window option
  - Real-time status updates
  - Error handling and troubleshooting

### 2. Server Actions
- **Location**: `lib/vapi-server-actions.ts`
- **Features**:
  - Secure API key handling
  - Configuration management
  - Connection testing
  - Report fetching

### 3. VAPI Client
- **Location**: `lib/vapi-client.ts`
- **Features**:
  - Advanced transcript processing
  - Automatic categorization
  - Report generation
  - Webhook processing

## 🔗 Integration Points

### Ethics Officer Dashboard
- Real-time VAPI reports appear automatically
- Audio playback controls
- One-click case creation
- Advanced filtering and search

### Voice Report Workflow
1. User clicks "Start Voice Report"
2. VAPI interface opens (iframe or popup)
3. User speaks their concerns
4. AI processes and categorizes the report
5. Report appears in ethics officer dashboard
6. Officer can review, play audio, and create cases

## 🛡️ Security Features

### Client-Side Security
- No sensitive API keys exposed to browser
- All API calls go through server actions
- Secure iframe integration
- CORS protection

### Server-Side Security
- API keys stored as environment variables
- Server-only VAPI client instance
- Webhook signature verification
- Input sanitization and validation

## 🧪 Testing

### Test Voice Functionality
1. Visit `/test-voice` page
2. Check all system requirements
3. Test voice widget functionality
4. Verify reports appear in dashboard

### Environment Validation
\`\`\`bash
node scripts/validate-env-simple.js
\`\`\`

## 📊 VAPI Report Processing

### Automatic Categorization
Reports are automatically categorized into:
- **Harassment**: Bullying, discrimination, hostile behavior
- **Fraud**: Financial misconduct, embezzlement
- **Safety**: Workplace hazards, accidents
- **Discrimination**: Bias, unfair treatment
- **Corruption**: Bribery, kickbacks
- **Retaliation**: Revenge, punishment
- **Other**: General concerns

### Priority Assignment
- **Critical**: Emergency, danger, violence
- **High**: Serious violations, illegal activity
- **Medium**: General concerns, policy issues
- **Low**: Minor issues, suggestions

### Generated Data
Each VAPI report includes:
- 10-digit case ID and report ID
- Tracking and secret codes
- Full transcript and summary
- Audio recording URL
- Timestamp and metadata
- Category and priority
- Processing status

## 🔄 Real-Time Updates

### Webhook Integration
- **Endpoint**: `/api/vapi/webhook`
- **Processing**: Real-time report creation
- **Database**: Automatic Supabase integration
- **Notifications**: Live dashboard updates

### Dashboard Integration
- Live report monitoring
- Audio playback controls
- Advanced filtering
- Export capabilities

## 🚀 Deployment

### Vercel Deployment
1. Set environment variables in Vercel dashboard
2. Deploy the application
3. Test voice functionality
4. Verify webhook endpoints

### Environment Variables in Vercel
\`\`\`bash
NEXT_PUBLIC_VAPI_ASSISTANT_ID=d63127d5-8ec7-4ed7-949a-1942ee4a3917
VAPI_API_KEY=your_actual_api_key
VAPI_SHARE_KEY=5d2ff1e9-46b9-4b45-8369-e6f0c65cb063
\`\`\`

## 🔍 Troubleshooting

### Common Issues
1. **Microphone not working**: Check HTTPS and permissions
2. **VAPI not loading**: Verify environment variables
3. **Reports not appearing**: Check webhook configuration
4. **Audio not playing**: Verify CORS settings

### Debug Tools
- Visit `/test-voice` for comprehensive diagnostics
- Check browser console for errors
- Verify environment variables
- Test VAPI connection

## 📈 Analytics and Monitoring

### Report Metrics
- Total voice reports processed
- Average processing time
- Category distribution
- Priority breakdown
- User engagement stats

### Performance Monitoring
- VAPI API response times
- Webhook processing speed
- Database query performance
- Error rates and types

## 🎯 Best Practices

### Voice Report Quality
- Encourage clear speech
- Provide conversation prompts
- Handle background noise
- Support multiple languages

### Data Privacy
- Secure audio storage
- Encrypted transcripts
- Access control
- Audit logging

### User Experience
- Clear instructions
- Progress indicators
- Error recovery
- Mobile optimization

## 📞 Support

For VAPI-related issues:
1. Check the test page diagnostics
2. Verify environment configuration
3. Review webhook logs
4. Contact VAPI support if needed

For platform integration issues:
1. Check server logs
2. Verify database connections
3. Test API endpoints
4. Review error messages

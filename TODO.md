# TODO List

## OAuth Setup
- [ ] Get Google_client_secret from Google Cloud Console after verification (Expected: Jan 3, 2024)
  - Waiting for ownership verification
  - Will be used for OAuth authentication in extension
  - Required for Google Docs API access
  - Google verification process typically takes 3-5 business days

### Steps Once Verified:
1. Get OAuth 2.0 credentials from Google Cloud Console
2. Add to environment variables:
   - GOOGLE_CLIENT_SECRET
   - Verify GOOGLE_CLIENT_ID matches new credentials
3. Update extension OAuth configuration
4. Test OAuth authentication flow

## Testing
- [ ] Run full test suite after OAuth credentials are set
- [ ] Verify OAuth integration tests
- [ ] Update test environment variables

## Documentation
- [ ] Add OAuth setup instructions to README
- [ ] Document environment variable requirements
- [ ] Add troubleshooting guide for OAuth issues 
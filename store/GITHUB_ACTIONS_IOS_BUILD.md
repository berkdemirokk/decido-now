# GitHub Actions iOS Build

This project includes a GitHub Actions workflow at:

`/.github/workflows/ios-local-build.yml`

It uses a macOS runner to build the iOS IPA locally with:

- `npx eas build --platform ios --local`

This does **not** use Expo cloud iOS build credits.

## What it can do

- Build a signed IPA on a GitHub macOS runner
- Upload the IPA as a GitHub Actions artifact
- Optionally submit the IPA to TestFlight

## Required repository secrets

### Required for local build

- `EXPO_TOKEN`

### Recommended for smoother Apple auth

- `EXPO_APPLE_TEAM_ID`
- `EXPO_APPLE_TEAM_TYPE`

### Required if you want to submit to TestFlight in the same workflow

One of these routes is needed:

1. App Store Connect API key route
- `EXPO_ASC_KEY_ID`
- `EXPO_ASC_ISSUER_ID`
- `EXPO_ASC_API_KEY_BASE64`

2. App-specific password route
- `EXPO_APPLE_APP_SPECIFIC_PASSWORD`

## How to run

1. Push this project to GitHub.
2. Open GitHub > `Actions`.
3. Run `iOS Local Build`.
4. Choose:
   - `production` for App Store/TestFlight-ready signing
   - `preview` for internal-style builds
5. Set `submit_to_testflight` to:
   - `false` if you only want the IPA artifact
   - `true` if you want automatic TestFlight upload

## Important notes

- GitHub macOS runners can be free for public repositories, but private repositories use included/billed macOS minutes depending on your GitHub plan.
- This workflow needs Apple signing credentials already available through Expo/EAS or provided via secrets.
- True iOS widget/live activity extensions are still separate native work and are not created by this workflow.
- Referral redemption still needs backend attribution if you want sender XP after a friend opens the link.

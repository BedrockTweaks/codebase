# @bt/analytics

Google Analytics (gtag.js) integration for BedrockTweaks that handles SSR hydration issues.

## Features

- Client-side only rendering to avoid SSR hydration issues
- Automatic script loading and initialization
- Context-based configuration
- TypeScript support

## Installation

This is an internal workspace package. Add it to your dependencies:

```json
{
  "dependencies": {
    "@bt/analytics": "workspace:*"
  }
}
```

## Usage

### Basic Setup

Wrap your application with the `GoogleAnalyticsProvider`:

```tsx
import { GoogleAnalyticsProvider, GoogleAnalytics } from '@bt/analytics';

function App() {
  return (
    <GoogleAnalyticsProvider measurementId={'G-XXXXXXXXXX'}>
      <GoogleAnalytics />
      {/* Your app content */}
    </GoogleAnalyticsProvider>
  );
}
```

## API

### `GoogleAnalyticsProvider`

Provider component that configures the Google Analytics measurement ID.

**Props:**
- `measurementId` (string, required): Your Google Analytics measurement ID (e.g., 'G-XXXXXXXXXX')
- `children` (ReactNode, required): Child components

### `GoogleAnalytics`

Component that loads and initializes the Google Analytics script. Place this once in your application root.

**Note:** This component only renders on the client side to avoid hydration issues.

## How it Works

1. The `GoogleAnalytics` component only renders after the client-side hydration
2. It dynamically loads the gtag.js script from Google
3. Initializes the analytics with your measurement ID
4. All loading happens client-side to prevent SSR/hydration mismatches

# @bt/analytics

Google Analytics (gtag.js) integration for BedrockTweaks that handles SSR hydration issues.

## Features

- Client-side only execution to avoid SSR hydration issues
- Automatic script loading and initialization
- Simple hook-based API
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

Call the `useGoogleAnalytics` hook in your root component:

```tsx
import { useGoogleAnalytics } from '@bt/analytics';

function App() {
  useGoogleAnalytics('G-XXXXXXXXXX');

  return (
    <div>
      {/* Your app content */}
    </div>
  );
}
```

## API

### `useGoogleAnalytics`

Hook that loads and initializes the Google Analytics script.

**Parameters:**
- `measurementId` (string, required): Your Google Analytics measurement ID (e.g., 'G-XXXXXXXXXX')

**Returns:**
- `isLoaded` (boolean): Whether the analytics script has loaded successfully

**Example:**
```tsx
const { isLoaded } = useGoogleAnalytics('G-XXXXXXXXXX');
```

## How it Works

1. The hook only executes on the client side to avoid hydration issues
2. It dynamically loads the gtag.js script from Google
3. Initializes the analytics with your measurement ID
4. Prevents duplicate script loading if called multiple times
5. Cleans up the script on unmount

# @bt/adsense

Google AdSense integration package for TanStack Start applications with SSR support.

## Features

- ✅ SSR-safe (no hydration issues)
- ✅ Auto-refresh ads on route changes
- ✅ TypeScript support
- ✅ Reusable components and hooks
- ✅ Auto Ads and Manual Ad Units support

## Installation

This package is part of the Bedrock Tweaks monorepo and uses pnpm workspaces.

```bash
pnpm add @bt/adsense
```

## Usage

### Setup Provider

First, wrap your application with the `AdSenseProvider` in your root layout:

```tsx
import { AdSenseProvider } from '@bt/adsense';

export default function RootLayout() {
  return (
    <html>
      <body>
        <AdSenseProvider clientId={'ca-pub-xxxxxxxxxxxxxxx'}>
          {/* Your app content */}
        </AdSenseProvider>
      </body>
    </html>
  );
}
```

### Auto Ads

Enable auto ads globally by adding the component inside the provider:

```tsx
import { AdSenseProvider, AdSenseAutoAds } from '@bt/adsense';

export default function RootLayout() {
  return (
    <html>
      <body>
        <AdSenseProvider clientId={'ca-pub-xxxxxxxxxxxxxxx'}>
          <AdSenseAutoAds />
          {/* Your app content */}
        </AdSenseProvider>
      </body>
    </html>
  );
}
```

### Manual Ad Units

Place ads anywhere in your application (must be within AdSenseProvider):

```tsx
import { AdSense } from '@bt/adsense';

export default function MyPage() {
  return (
    <div>
      <h1>{'My Page'}</h1>
      
      <AdSense
        slot={'1234567890'}
        format={'auto'}
        responsive={true}
      />
      
      <p>{'Content...'}</p>
    </div>
  );
}
```

## Components

### `AdSenseProvider`

Context provider for AdSense configuration. Wrap your application with this provider.

**Props:**
- `clientId` (string, required): Your AdSense publisher ID
- `children` (ReactNode, required): Your application content

### `AdSense`

Main component for displaying ad units. Must be used within `AdSenseProvider`.

**Props:**
- `slot` (string, required): Ad unit slot ID
- `format` (string, optional): Ad format - `auto`, `fluid`, `rectangle`, `vertical`, `horizontal` (default: `auto`)
- `responsive` (boolean, optional): Enable responsive ads (default: `true`)
- `style` (CSSProperties, optional): Custom inline styles
- `className` (string, optional): Custom CSS class

### `AdSenseAutoAds`

Component for enabling Google AdSense Auto Ads. Must be used within `AdSenseProvider`.

**Props:**
- No props required

## How It Works

1. **Client-Side Only**: All components and hooks check for client-side execution to avoid SSR hydration mismatches
2. **Script Management**: The script is loaded once per session and reused across components
3. **Route Awareness**: Ads automatically refresh when navigating between routes
4. **Type-Safe**: Full TypeScript support with proper type definitions

### Hydration errors

This package is designed to prevent hydration errors by only rendering on the client side.

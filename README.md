# M-Pesa Next.js Integration

**Safaricom Daraja API v3.0 — Next.js 15 App Router backend**
*by lucysees*

Drop this into your existing Next.js frontend to add full M-Pesa payment support via API Route Handlers. No standalone server required.

---

## What's included

| Path | Purpose |
|---|---|
| `src/lib/mpesa/client.ts` | Core Mpesa SDK class (ported from Daraja 3.0) |
| `src/lib/mpesa/service.ts` | Singleton service with automatic token caching |
| `src/lib/mpesa/types.ts` | All TypeScript interfaces & types |
| `src/lib/mpesa/security.ts` | RSA encryption for security credentials |
| `src/lib/mpesa/validation.ts` | Field validation & phone number normalisation |
| `src/app/api/mpesa/stk-push/route.ts` | STK Push (customer pays) |
| `src/app/api/mpesa/b2c/route.ts` | Business → Customer disbursement |
| `src/app/api/mpesa/b2b/route.ts` | Business → Business payment |
| `src/app/api/mpesa/balance/route.ts` | Account balance query |
| `src/app/api/mpesa/register-urls/route.ts` | Register C2B callback URLs |
| `src/app/api/mpesa/transaction-status/route.ts` | Query a past transaction |
| `src/app/api/mpesa/callbacks/stk/route.ts` | STK Push result webhook |
| `src/app/api/mpesa/callbacks/b2c-*/route.ts` | B2C result/timeout webhooks |
| `src/app/api/mpesa/callbacks/b2b-*/route.ts` | B2B result/timeout webhooks |
| `src/app/api/mpesa/callbacks/balance-*/route.ts` | Balance result/timeout webhooks |
| `src/app/api/mpesa/callbacks/transaction-status-*/route.ts` | Status result/timeout webhooks |
| `src/hooks/useMpesa.ts` | React hooks: `useSTKPush`, `useMpesaAction` |
| `src/components/MpesaPaymentForm.tsx` | Drop-in STK Push payment UI component |
| `src/app/pay/page.tsx` | Example payment page |
| `certs/ProductionCertificate.cer` | Safaricom public certificate (for B2B/B2C/balance) |

---

## Quick start

### 1. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=sandbox          # or "production"
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

Get credentials from the [Safaricom Developer Portal](https://developer.safaricom.co.ke/).

### 3. Expose your local server (for sandbox callbacks)

M-Pesa needs a publicly accessible URL to POST callbacks to. Use a tunnel:

```bash
ngrok http 3000
# Copy the https URL → set as NEXT_PUBLIC_BASE_URL in .env.local
```

### 4. Run the dev server

```bash
npm run dev
```

### 5. Test STK Push

```bash
curl -X POST http://localhost:3000/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1,
    "phoneNumber": "0712345678",
    "reference": "TEST-001",
    "description": "Test payment"
  }'
```

---

## Integrating into your existing frontend

### Option A — Use the drop-in form component

```tsx
// In any page or layout in your existing app
import MpesaPaymentForm from "@/components/MpesaPaymentForm";

export default function CheckoutPage() {
  return (
    <MpesaPaymentForm
      amount={1500}
      reference="ORDER-42"
      description="Booking deposit"
      lockAmount
      onSuccess={(data) => {
        // STK Push accepted — wait for the /callbacks/stk webhook
        console.log("Awaiting PIN:", data.CheckoutRequestID);
      }}
      onError={(msg) => alert(msg)}
    />
  );
}
```

### Option B — Use the React hook directly

```tsx
"use client";
import { useSTKPush } from "@/hooks/useMpesa";

export default function MyPayButton() {
  const { initiatePayment, loading, error } = useSTKPush();

  async function handlePay() {
    const result = await initiatePayment({
      amount: 500,
      phoneNumber: "0712345678",
      reference: "ORDER-99",
      description: "Monthly subscription",
    });

    if (result.success) {
      // Show "check your phone" UI
    }
  }

  return (
    <button onClick={handlePay} disabled={loading}>
      {loading ? "Sending…" : "Pay KES 500"}
    </button>
  );
}
```

### Option C — Call the API route directly (from any frontend)

```ts
const res = await fetch("/api/mpesa/stk-push", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: 100,
    phoneNumber: "254712345678",
    reference: "ORDER-1",
    description: "Payment",
  }),
});

const { success, data, message } = await res.json();
```

---

## Payment flow (STK Push)

```
User enters phone + amount
        │
        ▼
POST /api/mpesa/stk-push
        │
        ▼
Safaricom Daraja API
        │  (async — user sees PIN prompt on phone)
        ▼
POST /api/mpesa/callbacks/stk   ← Safaricom calls this
        │
        ▼
Update your DB / notify frontend
```

---

## Callback handling

Edit `src/app/api/mpesa/callbacks/stk/route.ts` to persist results to your database. Uncomment the Prisma example or add your own ORM calls.

The callback routes always return `{ ResultCode: 0, ResultDesc: "..." }` — this is required by Safaricom to acknowledge receipt.

---

## Registering C2B URLs (one-time setup)

```bash
curl -X POST http://localhost:3000/api/mpesa/register-urls \
  -H "Content-Type: application/json" \
  -d '{
    "shortCode": "YOUR_SHORTCODE",
    "confirmationUrl": "/api/mpesa/callbacks/stk",
    "validationUrl": "/api/mpesa/callbacks/stk"
  }'
```

---

## Tailwind CSS v4 notes

This project uses **Tailwind CSS v4**. Key differences from v3:

- `@import "tailwindcss"` replaces the old `@tailwind base/components/utilities` directives
- The PostCSS plugin is `@tailwindcss/postcss` (in `postcss.config.mjs`)
- No `tailwind.config.js` — all theme customisation goes in `globals.css` under `@theme { }`
- All Tailwind utility classes work the same as before

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   └── mpesa/
│   │       ├── stk-push/route.ts
│   │       ├── b2c/route.ts
│   │       ├── b2b/route.ts
│   │       ├── balance/route.ts
│   │       ├── register-urls/route.ts
│   │       ├── transaction-status/route.ts
│   │       └── callbacks/
│   │           ├── stk/route.ts
│   │           ├── b2c-result/route.ts
│   │           ├── b2c-timeout/route.ts
│   │           ├── b2b-result/route.ts
│   │           ├── b2b-timeout/route.ts
│   │           ├── balance-result/route.ts
│   │           ├── balance-timeout/route.ts
│   │           ├── transaction-status-result/route.ts
│   │           └── transaction-status-timeout/route.ts
│   ├── pay/page.tsx          ← example payment page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── MpesaPaymentForm.tsx  ← drop-in payment form
├── hooks/
│   └── useMpesa.ts           ← useSTKPush, useMpesaAction
└── lib/
    └── mpesa/
        ├── client.ts         ← core Mpesa class (server-only)
        ├── service.ts        ← singleton + token caching (server-only)
        ├── security.ts       ← RSA encryption (server-only)
        ├── validation.ts     ← field validation helpers
        ├── types.ts          ← all TypeScript types
        └── index.ts          ← barrel export
certs/
└── ProductionCertificate.cer ← Safaricom public key
```

---

*lucysees — built on Safaricom Daraja API v3.0*

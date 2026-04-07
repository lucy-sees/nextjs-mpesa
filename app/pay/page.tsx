/**
 * /app/pay/page.tsx
 *
 * Server Component — reads searchParams, then delegates rendering to the
 * Client Component shell (PayPageClient) which can safely hold callbacks.
 * @author lucysees
 */

import type { Metadata } from "next";
import PayPageClient from "./PayPageClient";

export const metadata: Metadata = {
  title: "Pay with M-Pesa",
  description: "Complete your payment securely via M-Pesa.",
};

interface PayPageProps {
  searchParams: Promise<{ amount?: string; ref?: string; desc?: string }>;
}

export default async function PayPage({ searchParams }: PayPageProps) {
  const params = await searchParams;
  const amount = params.amount ? parseInt(params.amount, 10) : undefined;
  const reference = params.ref ?? "ORDER";
  const description = params.desc ?? "Payment";

  return (
    <PayPageClient
      amount={amount}
      reference={reference}
      description={description}
      lockAmount={!!amount}
    />
  );
}

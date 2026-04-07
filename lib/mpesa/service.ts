/**
 * M-Pesa service singleton with automatic token caching & refresh.
 * Server-only — import only inside Route Handlers or Server Actions.
 * @author lucysees
 */

import { Mpesa } from "./client";
import { Environment } from "./types";
import type { ClientConfig } from "./types";

// ─── Config builder ──────────────────────────────────────────────────────────

/**
 * Builds a ClientConfig from environment variables.
 * Throws clearly if a required variable is missing.
 */
export function buildMpesaConfig(): ClientConfig {
  const required = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortCode: process.env.MPESA_SHORTCODE,
  } as const;

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      throw new Error(
        `Missing required environment variable for M-Pesa: ${key}. ` +
          "Copy .env.local.example to .env.local and fill in your credentials."
      );
    }
  }

  return {
    consumerKey: required.consumerKey!,
    consumerSecret: required.consumerSecret!,
    shortCode: required.shortCode!,
    passKey: process.env.MPESA_PASSKEY,
    environment:
      process.env.MPESA_ENVIRONMENT === "production"
        ? Environment.PRODUCTION
        : Environment.SANDBOX,
  };
}

// ─── Service class ───────────────────────────────────────────────────────────

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

class MpesaService {
  private readonly mpesa: Mpesa;
  private tokenCache: TokenCache | null = null;
  /** 60-second buffer so we never use a token that's about to expire */
  private static readonly TOKEN_BUFFER_MS = 60_000;

  constructor(config: ClientConfig) {
    this.mpesa = new Mpesa(config);
  }

  // ─── Token management ──────────────────────────────────────────────────────

  async getValidToken(): Promise<string> {
    const now = Date.now();

    if (
      this.tokenCache &&
      this.tokenCache.expiresAt > now + MpesaService.TOKEN_BUFFER_MS
    ) {
      return this.tokenCache.token;
    }

    try {
      const authResponse = await this.mpesa.getAccessToken();
      const expiresInMs = parseInt(authResponse.expires_in, 10) * 1_000;

      this.tokenCache = {
        token: authResponse.access_token,
        expiresAt: now + expiresInMs,
      };

      return authResponse.access_token;
    } catch (error) {
      this.tokenCache = null;
      throw new Error(
        `Failed to obtain M-Pesa access token: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async ensureToken(): Promise<void> {
    await this.getValidToken();
  }

  // ─── Proxy methods (auto-refresh token before every call) ─────────────────

  async sendSTKPush(
    ...args: Parameters<Mpesa["sendSTKPush"]>
  ): ReturnType<Mpesa["sendSTKPush"]> {
    await this.ensureToken();
    return this.mpesa.sendSTKPush(...args);
  }

  async registerUrls(
    ...args: Parameters<Mpesa["registerUrls"]>
  ): ReturnType<Mpesa["registerUrls"]> {
    await this.ensureToken();
    return this.mpesa.registerUrls(...args);
  }

  async B2C(
    ...args: Parameters<Mpesa["B2C"]>
  ): ReturnType<Mpesa["B2C"]> {
    await this.ensureToken();
    return this.mpesa.B2C(...args);
  }

  async getAccountBalance(
    ...args: Parameters<Mpesa["getAccountBalance"]>
  ): ReturnType<Mpesa["getAccountBalance"]> {
    await this.ensureToken();
    return this.mpesa.getAccountBalance(...args);
  }

  async generateDynamicQRCode(
    ...args: Parameters<Mpesa["generateDynamicQRCode"]>
  ): ReturnType<Mpesa["generateDynamicQRCode"]> {
    await this.ensureToken();
    return this.mpesa.generateDynamicQRCode(...args);
  }

  async getTransactionStatus(
    ...args: Parameters<Mpesa["getTransactionStatus"]>
  ): ReturnType<Mpesa["getTransactionStatus"]> {
    await this.ensureToken();
    return this.mpesa.getTransactionStatus(...args);
  }

  async initiateReversal(
    ...args: Parameters<Mpesa["initiateReversal"]>
  ): ReturnType<Mpesa["initiateReversal"]> {
    await this.ensureToken();
    return this.mpesa.initiateReversal(...args);
  }

  async remittTax(
    ...args: Parameters<Mpesa["remittTax"]>
  ): ReturnType<Mpesa["remittTax"]> {
    await this.ensureToken();
    return this.mpesa.remittTax(...args);
  }

  async initiateB2BPayment(
    ...args: Parameters<Mpesa["initiateB2BPayment"]>
  ): ReturnType<Mpesa["initiateB2BPayment"]> {
    await this.ensureToken();
    return this.mpesa.initiateB2BPayment(...args);
  }

  async createStandingOrder(
    ...args: Parameters<Mpesa["createStandingOrder"]>
  ): ReturnType<Mpesa["createStandingOrder"]> {
    await this.ensureToken();
    return this.mpesa.createStandingOrder(...args);
  }
}

// ─── Singleton ───────────────────────────────────────────────────────────────

// In Next.js 15, Route Handlers run in Node.js — module-level singletons
// persist for the lifetime of the server process, giving us token caching
// across requests at no extra cost.
let _instance: MpesaService | null = null;

export function getMpesaService(): MpesaService {
  if (!_instance) {
    _instance = new MpesaService(buildMpesaConfig());
  }
  return _instance;
}

export { MpesaService };

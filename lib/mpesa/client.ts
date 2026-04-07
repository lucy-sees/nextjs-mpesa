/**
 * Core M-Pesa Daraja API v3.0 client
 * Server-only — never import this from client components.
 * @author lucysees
 */

import dayjs from "dayjs";
import type {
  AccountBalanceQueryConfig,
  AuthResponse,
  B2BPaymentQuery,
  B2CTransactionConfig,
  ClientConfig,
  DynamicQRCodeQuery,
  DynamicQRCodeResponse,
  InitiateReversalQuery,
  RemittTaxQuery,
  StandingOrderCreationQuery,
  STKQuery,
  STKPushResponse,
  TransactionStatusQuery,
  APIResponseSuccessType,
  UrlRegisterConfig,
} from "./types";

export class Mpesa {
  private readonly config: ClientConfig;
  private BASE_URL: string;
  private token: string | undefined;

  constructor(configs: ClientConfig) {
    this.BASE_URL =
      configs.environment !== "production"
        ? "https://sandbox.safaricom.co.ke"
        : "https://api.safaricom.co.ke";
    this.config = configs;
  }

  // ─── Authentication ─────────────────────────────────────────────────────────

  async getAccessToken(): Promise<AuthResponse> {
    const credentials = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString("base64");

    const response = await fetch(
      `${this.BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: { Authorization: `Basic ${credentials}` },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `M-Pesa auth failed (${response.status}): ${text}`
      );
    }

    const data: AuthResponse = await response.json();
    this.token = data.access_token;
    return data;
  }

  // ─── STK Push ───────────────────────────────────────────────────────────────

  async sendSTKPush(stkQuery: STKQuery): Promise<STKPushResponse> {
    const { amount, sender, callbackUrl, reference, description } = stkQuery;
    const timestamp = dayjs().format("YYYYMMDDHHmmss");
    const passkey = this.config.passKey ?? "";
    const password = Buffer.from(
      `${this.config.shortCode}${passkey}${timestamp}`
    ).toString("base64");

    const response = await fetch(
      `${this.BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: this.config.shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: sender,
          PartyB: this.config.shortCode,
          PhoneNumber: sender,
          CallBackURL: callbackUrl,
          AccountReference: reference,
          TransactionDesc: description,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`STK Push failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<STKPushResponse>;
  }

  // ─── C2B URL Registration ───────────────────────────────────────────────────

  async registerUrls(registerParams: UrlRegisterConfig): Promise<unknown> {
    const response = await fetch(
      `${this.BASE_URL}/mpesa/c2b/v2/registerurl`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerParams),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Register URLs failed (${response.status}): ${text}`
      );
    }

    return response.json();
  }

  // ─── B2C ────────────────────────────────────────────────────────────────────

  async B2C(b2cTransaction: B2CTransactionConfig): Promise<unknown> {
    const response = await fetch(
      `${this.BASE_URL}/mpesa/b2c/v1/paymentrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(b2cTransaction),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`B2C failed (${response.status}): ${text}`);
    }

    return response.json();
  }

  // ─── Account Balance ────────────────────────────────────────────────────────

  async getAccountBalance(
    balanceQuery: AccountBalanceQueryConfig
  ): Promise<unknown> {
    balanceQuery.CommandID = "AccountBalance";
    balanceQuery.IdentifierType = "4";

    const response = await fetch(
      `${this.BASE_URL}/mpesa/accountbalance/v1/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(balanceQuery),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Account balance query failed (${response.status}): ${text}`
      );
    }

    return response.json();
  }

  // ─── Dynamic QR Code ────────────────────────────────────────────────────────

  async generateDynamicQRCode(
    dynamicQRCodeQuery: DynamicQRCodeQuery
  ): Promise<DynamicQRCodeResponse> {
    const response = await fetch(
      `${this.BASE_URL}/mpesa/qrcode/v1/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dynamicQRCodeQuery),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`QR code generation failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<DynamicQRCodeResponse>;
  }

  // ─── Transaction Status ─────────────────────────────────────────────────────

  async getTransactionStatus(
    transactionStatusQuery: TransactionStatusQuery
  ): Promise<APIResponseSuccessType> {
    const response = await fetch(
      `${this.BASE_URL}/mpesa/transactionstatus/v1/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionStatusQuery),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Transaction status query failed (${response.status}): ${text}`
      );
    }

    return response.json() as Promise<APIResponseSuccessType>;
  }

  // ─── Reversal ───────────────────────────────────────────────────────────────

  async initiateReversal(
    initiateReversalQuery: InitiateReversalQuery
  ): Promise<APIResponseSuccessType> {
    const response = await fetch(
      `${this.BASE_URL}/mpesa/reversal/v1/initiate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(initiateReversalQuery),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Reversal failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<APIResponseSuccessType>;
  }

  // ─── Tax Remittance ─────────────────────────────────────────────────────────

  async remittTax(remittTaxQuery: RemittTaxQuery): Promise<APIResponseSuccessType> {
    const response = await fetch(
      `${this.BASE_URL}/mpesa/remitttax/v1/initiate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(remittTaxQuery),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Tax remittance failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<APIResponseSuccessType>;
  }

  // ─── B2B Payment ────────────────────────────────────────────────────────────

  async initiateB2BPayment(
    b2bPaymentQuery: B2BPaymentQuery
  ): Promise<APIResponseSuccessType> {
    const response = await fetch(
      `${this.BASE_URL}/mpesa/b2b/v1/paymentrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(b2bPaymentQuery),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`B2B payment failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<APIResponseSuccessType>;
  }

  // ─── Standing Order ─────────────────────────────────────────────────────────

  /**
   * Creates a standing order for recurring revenue collection.
   * Requires the M-Pesa Ratiba product to be enabled on your account.
   */
  async createStandingOrder(
    standingOrderCreationQuery: StandingOrderCreationQuery
  ): Promise<APIResponseSuccessType> {
    const response = await fetch(
      `${this.BASE_URL}/standingorder/v1/createStandingOrderExternal`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(standingOrderCreationQuery),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Standing order creation failed (${response.status}): ${text}`
      );
    }

    return response.json() as Promise<APIResponseSuccessType>;
  }
}

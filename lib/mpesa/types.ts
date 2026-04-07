/**
 * M-Pesa Daraja API v3.0 — TypeScript interfaces
 * @author lucysees
 */

// ─── Environment ────────────────────────────────────────────────────────────

export enum Environment {
  SANDBOX = "sandbox",
  PRODUCTION = "production",
}

// ─── Client Configuration ────────────────────────────────────────────────────

export interface ClientConfig {
  consumerKey: string;
  consumerSecret: string;
  environment?: Environment;
  shortCode: string;
  passphrase?: string;
  passKey?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  expires_in: string;
  access_token: string;
}

// ─── C2B / URL Registration ──────────────────────────────────────────────────

export type UrlRegisterResponseType = "Completed" | "Cancelled";

export interface UrlRegisterConfig {
  ShortCode: string;
  ResponseType: UrlRegisterResponseType;
  ConfirmationURL: string;
  ValidationURL: string;
}

// ─── STK Push ────────────────────────────────────────────────────────────────

export interface STKQuery {
  amount: number;
  sender: string;
  reference: string;
  callbackUrl: string;
  description: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

// ─── STK Push Callback ───────────────────────────────────────────────────────

export interface STKCallbackMetadataItem {
  Name: string;
  Value?: string | number;
}

export interface STKCallbackBody {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: STKCallbackMetadataItem[];
  };
}

export interface STKCallbackPayload {
  Body: {
    stkCallback: STKCallbackBody;
  };
}

// ─── B2C ─────────────────────────────────────────────────────────────────────

export interface B2CTransactionConfig {
  InitiatorName: string;
  SecurityCredential: string;
  CommandID: string;
  Amount: string;
  PartyA: string;
  PartyB: string;
  Remarks: string;
  QueueTimeOutURL: string;
  ResultURL: string;
  Occassion: string;
}

// ─── B2B ─────────────────────────────────────────────────────────────────────

export type B2BPaymentCommandID =
  | "BusinessPayBill"
  | "BusinessBuyGoods"
  | "BusinessPayToPochi"
  | "BusinessPayToBulk";

export interface B2BPaymentQuery {
  Initiator: string;
  SecurityCredential: string;
  CommandID: B2BPaymentCommandID;
  SenderIdentifierType: string;
  RecieverIdentifierType: string;
  Amount: string;
  PartyA: string;
  PartyB: string;
  AccountReference: string;
  Requester: string;
  Remarks: string;
  QueueTimeOutURL: string;
  ResultURL: string;
}

// ─── Account Balance ─────────────────────────────────────────────────────────

export interface AccountBalanceQueryConfig {
  CommandID?: string;
  PartyA: number;
  IdentifierType?: string;
  Remarks: string;
  Initiator: string;
  SecurityCredential: string;
  QueueTimeOutURL: string;
  ResultURL: string;
}

// ─── Dynamic QR Code ─────────────────────────────────────────────────────────

export interface DynamicQRCodeQuery {
  MerchantName: string;
  RefNo: string;
  Amount: number;
  TrxCode: string;
  CPI: string;
  Size: string;
}

export interface DynamicQRCodeResponse {
  ResponseCode: string;
  RequestID: string;
  ResponseDescription: string;
  QRCode: string;
}

// ─── Transaction Status ──────────────────────────────────────────────────────

export interface TransactionStatusQuery {
  Initiator: string;
  SecurityCredential: string;
  TransactionID: string;
  OriginalConversationID: string;
  PartyA: string;
  IdentifierType: string;
  ResultURL: string;
  QueueTimeOutURL: string;
  Remarks: string;
  Occasion: string;
}

// ─── Reversal ────────────────────────────────────────────────────────────────

export interface InitiateReversalQuery {
  Initiator: string;
  SecurityCredential: string;
  CommandID: string;
  TransactionID: string;
  Amount: string;
  ReceiverParty: string;
  RecieverIdentifierType: string;
  ResultURL: string;
  QueueTimeOutURL: string;
  Remarks: string;
}

// ─── Tax Remittance ──────────────────────────────────────────────────────────

export interface RemittTaxQuery {
  Initiator: string;
  SecurityCredential: string;
  CommandID: string;
  SenderIdentifierType: string;
  RecieverIdentifierType: string;
  Amount: string;
  PartyA: string;
  PartyB: string;
  AccountReference: string;
  Remarks: string;
  QueueTimeOutURL: string;
  ResultURL: string;
}

// ─── Standing Order ──────────────────────────────────────────────────────────

export interface StandingOrderCreationQuery {
  StandingOrderName: string;
  StartDate: string;
  EndDate: string;
  BusinessShortCode: string;
  TransactionType: string;
  ReceiverPartyIdentifierType: string;
  Amount: string;
  PartyA: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
  Frequency: string;
}

// ─── Generic API Response ────────────────────────────────────────────────────

export interface APIResponseSuccessType {
  OriginatorConversationID: string;
  ConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

// ─── Next.js API helpers ─────────────────────────────────────────────────────

/** Standard JSON shape returned by all /api/mpesa/* routes */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Body accepted by POST /api/mpesa/stk-push */
export interface STKPushRequestBody {
  amount: number;
  phoneNumber: string;
  reference: string;
  description: string;
}

/** Body accepted by POST /api/mpesa/b2c */
export interface B2CRequestBody {
  amount: string;
  phoneNumber: string;
  remarks: string;
  occasion?: string;
  initiatorName: string;
  securityCredential: string;
}

/** Body accepted by POST /api/mpesa/register-urls */
export interface RegisterUrlsRequestBody {
  shortCode: string;
  confirmationUrl: string;
  validationUrl: string;
}

/** Body accepted by POST /api/mpesa/balance */
export interface BalanceRequestBody {
  partyA: string;
  remarks: string;
  initiator: string;
  securityCredential: string;
}

/** Body accepted by POST /api/mpesa/b2b */
export interface B2BRequestBody {
  amount: string;
  paybillNumber: string;
  accountReference: string;
  remarks: string;
  initiatorName: string;
  securityCredential: string;
}

/** Body accepted by POST /api/mpesa/transaction-status */
export interface TransactionStatusRequestBody {
  transactionId: string;
  partyA: string;
  originalConversationID?: string;
  remarks: string;
  initiatorName: string;
  securityCredential: string;
}

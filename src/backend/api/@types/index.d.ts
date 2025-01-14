// Extend request object with additional properties that might be added in middleware
declare namespace Express {
  export interface Request {
    userId?: number;
    externalUserIdentifier?: string;
    userName?: string;
  }
}

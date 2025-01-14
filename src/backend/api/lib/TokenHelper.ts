import jwt, { type JwtPayload, type GetPublicKeyOrSecret } from "jsonwebtoken";
import jwksClient, { JwksClient } from "jwks-rsa";

export type TokenHelperConfig = {
  jwksUrl: string;
};

export class TokenHelper {
  private jwksClient: JwksClient;

  constructor(jwksUrl: string) {
    this.jwksClient = jwksClient({
      jwksUri: jwksUrl,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 1000 * 60 * 60 * 6, // Cache public keys for six hours (they should rotate every ~24 hour or so)
    });
  }

  async validateToken(token: string): Promise<string | JwtPayload | undefined> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.getKeyByKid, (err, payload) => {
        if (err) {
          resolve(undefined);
        }

        resolve(payload);
      });
    });
  }

  private getKeyByKid: GetPublicKeyOrSecret = async (jwtHeader, callback) => {
    try {
      const key = await this.jwksClient.getSigningKey(jwtHeader.kid);
      callback(null, key.getPublicKey());
    } catch (err) {
      callback(err as Error);
    }
  };
}

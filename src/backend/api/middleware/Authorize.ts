import { RequestHandler } from "express";
import { TokenHelper } from "../lib/TokenHelper.js";
import { TRole } from "../types/Database.js";
import { UsersDAO } from "../dao/UsersDAO.js";

import { env } from "../Env.js";

const tokenHelper = new TokenHelper(env.jwksUrl);

/**
 * Validates that a user sent a valid token, but doesn't check for role
 */
const Authenticate: () => RequestHandler = () => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.sendStatus(401);
      return;
    }
    const authHeaderParts = authHeader.split(" ");

    if (authHeaderParts.length !== 2) {
      res.sendStatus(401);
      return;
    }

    const tokenPayload = await tokenHelper.validateToken(authHeaderParts[1]);

    if (!tokenPayload) {
      res.sendStatus(401);
      return;
    }

    if (typeof tokenPayload !== "object" || !tokenPayload.oid) {
      res.sendStatus(401);
      return;
    }

    req.externalUserIdentifier = tokenPayload.oid;
    req.userName = tokenPayload.name?.toString();

    next();
  };
};

/**
 * Validates that a user sent a valid token and that a user has a valid role
 */
export const Authorize: (roles: TRole[]) => RequestHandler = (roles) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const authHeaderParts = authHeader.split(" ");

      if (authHeaderParts.length !== 2) {
        res.sendStatus(401);
        return;
      }

      const tokenPayload = await tokenHelper.validateToken(authHeaderParts[1]);

      if (!tokenPayload) {
        res.sendStatus(401);
        return;
      }

      if (typeof tokenPayload == "object" && tokenPayload.oid) {
        req.externalUserIdentifier = tokenPayload.oid;

        const user = await UsersDAO.getUserByExternalId(tokenPayload.oid);

        if (!user || !user.role || !user.role) {
          res.sendStatus(403);
          return;
        }

        if (roles.includes(user.role)) {
          req.userId = user.id;
          req.userName = user.name;

          next();
          return;
        } else {
          res.sendStatus(403);
          return;
        }
      } else {
        res.sendStatus(401);
        return;
      }
    } else {
      res.sendStatus(401);
      return;
    }
  };
};

export { Authenticate };

import { RequestHandler } from "express";
import z, { number, ZodError } from "zod";

import { UsersDAO } from "../dao/UsersDAO.js";
import { base64UrlDecode, base64UrlEncode } from "../lib/Base64Helper.js";
import { TFilterResult } from "../types/Filter.js";
import { User } from "../types/Database.js";

export class UserHandler {
  static getUserData: RequestHandler = async (req, res) => {
    if (!req.externalUserIdentifier) {
      res.sendStatus(401);
      return;
    }

    const userData = await UsersDAO.getUserByExternalId(
      req.externalUserIdentifier,
    );

    if (!userData) {
      const userCount = await UsersDAO.getUserCount();

      const createdUser = await UsersDAO.createUser({
        externalUserIdentifier: req.externalUserIdentifier,
        role: userCount === 0 ? "Admin" : "User",
        name: req.userName ?? "?",
      });

      res.json(createdUser);
      return;
    }

    if (userData.name !== req.userName) {
      const updatedUserData = await UsersDAO.updateUserById(userData.id, {
        role: userData.role,
        name: req.userName ?? "?",
      });
      res.json(updatedUserData);
      return;
    }

    res.json(userData);
    return;
  };

  static updateUser: RequestHandler = async (req, res) => {
    const userIdValidator = z.number().min(1);

    let userId: z.infer<typeof userIdValidator>;

    try {
      userId = userIdValidator.parse(Number.parseInt(req.params.id));
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400);
        res.json(err.format());
      }
      return;
    }

    const userValidator = z.object({
      role: z.union([z.literal("Admin"), z.literal("User")]).optional(),
      name: z.string().optional(),
    });

    let user: z.infer<typeof userValidator> | undefined;

    try {
      user = userValidator.parse(req.body);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400);
        res.json(err.format());
      }
      return;
    }

    const foundUser = await UsersDAO.getUserById(userId);

    if (!foundUser) {
      res.sendStatus(404);
      return;
    }

    if (user.role && user.role === "User") {
      const adminCount = await UsersDAO.getUserCountByRole("Admin");

      if (adminCount === 1) {
        res.statusCode = 400;
        res.json(
          new ZodError([
            {
              message:
                "Cannot degrade admin to user, only one admin remaining!",
              code: "custom",
              path: ["role"],
            },
          ]),
        );
        return;
      }
    }

    Object.assign(foundUser, user); // Combine existing user with incoming changes

    const updatedUser = await UsersDAO.updateUserById(userId, foundUser);

    res.json(updatedUser);
    return;
  };

  static searchUsers: RequestHandler = async (req, res) => {
    const searchParamsValidator = z.object({
      filter: z.literal("id"),
      order: z.union([z.literal("asc"), z.literal("desc")]),
      cursor: z.string().optional(),
      resultCount: z.coerce.number().min(1).max(200).optional().default(5),
    });

    const cursorValidator = z.object({
      id: z.number(),
    });

    let searchParams: z.infer<typeof searchParamsValidator> | undefined;
    let decodedCursor: z.infer<typeof cursorValidator> | undefined;

    try {
      searchParams = searchParamsValidator.parse(req.query);

      if (searchParams.cursor) {
        decodedCursor = cursorValidator.parse(
          JSON.parse(base64UrlDecode(searchParams.cursor)),
        );
      }
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400);
        res.json(err.format());
      }
      return;
    }

    // Limit result count to searchParams.resultCount + 1 so we can determine if there are any more results beyond this page and we can set hasNextPage correctly
    const userSearchResult = await UsersDAO.searchUsers(
      searchParams.resultCount + 1,
      searchParams.order,
      decodedCursor,
    );
    let newCursor: string | undefined;

    if (userSearchResult.length > 0) {
      const nextCursorIndex =
        userSearchResult.length > searchParams.resultCount
          ? userSearchResult.length - 2
          : userSearchResult.length - 1;

      newCursor = base64UrlEncode(
        JSON.stringify({ id: userSearchResult[nextCursorIndex].id }),
      );
    }

    const responseBody: TFilterResult<User> = {
      cursor: newCursor,
      hasNextPage: userSearchResult.length > searchParams.resultCount,
      results:
        userSearchResult.length > searchParams.resultCount
          ? userSearchResult.slice(0, searchParams.resultCount)
          : userSearchResult,
    };

    res.json(responseBody);
  };
}

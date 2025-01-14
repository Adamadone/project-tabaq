import { RequestHandler } from "express";
import { z } from "zod";
import { tagsDao } from "../dao/TagsDAO.js";
import { TFilterResult } from "../types/Filter.js";
import { Tag } from "../types/Database.js";
import { base64UrlDecode, base64UrlEncode } from "../lib/Base64Helper.js";

export class TagsHandler {
  static search: RequestHandler = async (req, res) => {
    const querySchema = z.object({
      nameContains: z.string().optional(),
      limit: z.coerce.number().default(5),
      cursor: z.string().base64().optional(),
    });

    const queryValidation = querySchema.safeParse(req.query);
    if (!queryValidation.success) {
      res.status(400);
      res.json(queryValidation.error);
      return;
    }

    let cursorObject: { lastId: number } | undefined;

    if (queryValidation.data.cursor) {
      cursorObject = JSON.parse(base64UrlDecode(queryValidation.data.cursor));
    }

    const query: Parameters<typeof tagsDao.search> = [
      {
        // Get one more tag than requested to figure out if search has next page
        limit: queryValidation.data.limit + 1,
        cursor: cursorObject,
        nameContains: queryValidation.data.nameContains,
      },
    ];

    try {
      const tags = await tagsDao.search(...query);

      // Prevent returning additional tag we used to determine if search has next page
      const tagsToReturn = tags.slice(
        0,
        tags.length > queryValidation.data.limit
          ? queryValidation.data.limit
          : tags.length,
      );

      let newCursorObject: { lastId: number } | undefined;

      if (tags.length > 0) {
        newCursorObject = { lastId: tagsToReturn[tagsToReturn.length - 1]?.id };
      }

      const responseBody: TFilterResult<Tag> = {
        hasNextPage: tags.length > queryValidation.data.limit,
        results: tagsToReturn,
        cursor: newCursorObject
          ? base64UrlEncode(JSON.stringify(newCursorObject))
          : undefined,
      };

      res.json(responseBody);
    } catch (e) {
      console.log(e);
      res.status(500);
      res.json(e);
    }
  };
}

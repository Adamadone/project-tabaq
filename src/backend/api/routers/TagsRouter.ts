import express from "express";
import { TagsHandler } from "../handlers/TagsHandler.js";

export const tagsRouter = express.Router();

tagsRouter.get("/search", TagsHandler.search);

import express from "express";

import { UserHandler } from "../handlers/UserHandler.js";
import { Authenticate, Authorize } from "../middleware/Authorize.js";

export const userRouter = express.Router();

userRouter.use(Authenticate());

userRouter.get("/", UserHandler.getUserData);

userRouter.get("/search", UserHandler.searchUsers);

userRouter.patch("/:id", Authorize(["Admin"]), UserHandler.updateUser);

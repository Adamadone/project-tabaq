import express from "express";
import { Authorize } from "../middleware/Authorize.js";
import { companyHandler } from "../handlers/CompanyHandler.js";

export const companiesRouter = express.Router();

companiesRouter.get("/search", companyHandler.searchCompanies);

companiesRouter.get("/:id", companyHandler.getCompanyById);

companiesRouter.post("/", Authorize(["Admin"]), companyHandler.createCompany);

companiesRouter.put("/:id", Authorize(["Admin"]), companyHandler.updateCompany);

companiesRouter.delete(
  "/:id",
  Authorize(["Admin"]),
  companyHandler.deleteCompany,
);

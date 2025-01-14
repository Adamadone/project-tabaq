const dbConnString = process.env.DB_CONN_STRING;
if (!dbConnString) throw new Error("Db connection string cannot be empty");

const jwksUrl = process.env.JWKS_URL;
if (!jwksUrl) throw new Error("Jwks sync URL cannot be empty");

const imageDir = process.env.IMAGE_DIR;
if (!imageDir) throw new Error("Image dir cannot be empty");

const env = {
  dbConnString,
  jwksUrl,
  imageDir,
};

export { env };

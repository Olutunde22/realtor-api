export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  databaseURL: process.env.DATABASE_URL,
  tokenSecret: process.env.TOKEN_SECRET,
  tokenExpires: process.env.TOKEN_EXPIRES,
  productKeySecret: process.env.PRODUCT_KEY_SECRET,
});

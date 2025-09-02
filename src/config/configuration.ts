
export default () => ({
   smtp: {
    host: process.env.SMTP_HOST,
    port: (process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET ,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
    database: {
    url: process.env.DATABASE_URL,
  },

});
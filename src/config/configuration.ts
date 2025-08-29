export default () => ({
  smtp: {
    host: process.env.SMTP_HOST,
    port: (process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
});
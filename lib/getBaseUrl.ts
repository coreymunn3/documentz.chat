if (!process.env.VERCEL_URL) {
  throw new Error("Missing production URL for the base URL");
}

const getBaseUrl = () => {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3030"
    : `https://${process.env.VERCEL_URL}`;
};

export default getBaseUrl;

const getBaseUrl = () => {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3030"
    : process.env.VERCEL_URL;
};

export default getBaseUrl;

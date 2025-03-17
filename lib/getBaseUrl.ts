const getBaseUrl = () => {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3030"
    : "http://localhost:3030";
};

export default getBaseUrl;

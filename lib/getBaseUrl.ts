const getBaseUrl = () => {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3030";
  }

  // First try to use our custom domain environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `https://${process.env.NEXT_PUBLIC_SITE_URL}`;
  }

  // Fall back to Vercel URL if our custom domain isn't set
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Final fallback
  throw new Error("Missing production URL for the base URL");
};

export default getBaseUrl;

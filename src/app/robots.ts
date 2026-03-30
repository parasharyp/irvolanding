import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/systems", "/settings"],
    },
    sitemap: "https://irvo.co.uk/sitemap.xml",
  };
}

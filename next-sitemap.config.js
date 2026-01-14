/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.blubeez.ai',
  generateRobotsTxt: false, // We manage robots.txt manually for AI crawlers
  generateIndexSitemap: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: [
    '/api/*',
    '/creator',
    '/creator/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/creator/'],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom priority for specific pages
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },
  additionalPaths: async (config) => {
    const result = [];
    
    // Add any additional static paths here
    // For example, destination pages when they exist
    
    return result;
  },
};

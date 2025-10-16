import { useEffect } from 'react';

/**
 * SEO component for managing meta tags and structured data
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} keywords - Meta keywords
 * @param {Object} structuredData - Array of JSON-LD structured data objects
 */
const SEO = ({ title, description, keywords, structuredData = [] }) => {
  useEffect(() => {
    // Title
    if (title) {
      document.title = title;
    }
    
    // Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }
    
    // Meta Keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }
    
    // Open Graph Tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:url': window.location.href
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      if (content) {
        let ogTag = document.querySelector(`meta[property="${property}"]`);
        if (!ogTag) {
          ogTag = document.createElement('meta');
          ogTag.setAttribute('property', property);
          document.head.appendChild(ogTag);
        }
        ogTag.setAttribute('content', content);
      }
    });
    
    // Twitter Card
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      if (content) {
        let twitterTag = document.querySelector(`meta[name="${name}"]`);
        if (!twitterTag) {
          twitterTag = document.createElement('meta');
          twitterTag.name = name;
          document.head.appendChild(twitterTag);
        }
        twitterTag.setAttribute('content', content);
      }
    });
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;
    
    // Structured Data - Remove existing schemas
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    existingSchemas.forEach(schema => schema.remove());
    
    // Add new schema scripts
    structuredData.forEach(schema => {
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.text = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    });
    
    // Cleanup function
    return () => {
      // Meta tags will remain for page navigation
    };
  }, [title, description, keywords, structuredData]);

  return null;
};

export default SEO;

import SEO from '../components/SEO';
import HeroSection from '../components/HeroSection';
import SearchSection from '../components/SearchSection';
import FeaturesSection from '../components/FeaturesSection';
import FeaturedVehicles from '../components/FeaturedVehicles';
import CTASection from '../components/CTASection';

const Home = () => {
  // SEO structured data
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "CarDnD",
      "description": "Peer-to-peer vehicle rental platform",
      "url": window.location.origin,
      "logo": window.location.origin + "/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "availableLanguage": ["English", "Tagalog"]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "2000",
        "bestRating": "5"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "CarDnD",
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": window.location.origin + "/vehicles?location={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Vehicle Rental",
      "provider": {
        "@type": "Organization",
        "name": "CarDnD"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Philippines"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Vehicle Rental Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Car Rental"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Motorcycle Rental"
            }
          }
        ]
      }
    }
  ];

  return (
    <>
      <SEO
        title="CarDnD - Rent Cars & Motorcycles from Trusted Owners | Peer-to-Peer Vehicle Rental"
        description="Discover the best peer-to-peer car and motorcycle rental platform in the Philippines. Rent vehicles from verified owners in Cebu, Manila, and nationwide. Earn passive income by listing your vehicle. 500+ vehicles, 4.8★ rating, 24/7 support."
        keywords="car rental, motorcycle rental, vehicle rental, peer-to-peer rental, rent a car Philippines, Cebu car rental, Manila car rental, motorcycle rental Cebu, host vehicle, earn passive income, verified owners, trusted car rental"
        structuredData={structuredData}
      />
      <main className="min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#171717] to-[#0d0d0d]">
        <HeroSection />
        <SearchSection />
        <FeaturesSection />
        <FeaturedVehicles />
        <CTASection />
      </main>
    </>
  );
};

export default Home;

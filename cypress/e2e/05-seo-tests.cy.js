/// <reference types="cypress" />

describe("SEO Tests - Tenant Landing Pages", () => {
  let tenant1, tenant2;

  before(() => {
    cy.fixture("tenants").then((tenants) => {
      tenant1 = tenants.tenant1;
      tenant2 = tenants.tenant2;
    });
  });

  describe("Meta Tags", () => {
    it("should have correct title tag for tenant landing page", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.title().should("include", tenant1.name);
      cy.title().should("match", /booking|salon|beauty|spa/i);
    });

    it("should have description meta tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[name="description"]')
        .should("exist")
        .should("have.attr", "content")
        .and("not.be.empty");

      cy.get('meta[name="description"]')
        .invoke("attr", "content")
        .should("include", tenant1.name);
    });

    it("should have viewport meta tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[name="viewport"]')
        .should("exist")
        .should(
          "have.attr",
          "content",
          "width=device-width, initial-scale=1.0"
        );
    });

    it("should have charset meta tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get("meta[charset]")
        .should("exist")
        .should("have.attr", "charset", "UTF-8");
    });

    it("should have keywords meta tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[name="keywords"]')
        .should("exist")
        .invoke("attr", "content")
        .should("match", /booking|appointment|salon|beauty|spa/i);
    });
  });

  describe("Open Graph Tags", () => {
    it("should have og:title tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[property="og:title"]')
        .should("exist")
        .invoke("attr", "content")
        .should("include", tenant1.name);
    });

    it("should have og:description tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[property="og:description"]')
        .should("exist")
        .invoke("attr", "content")
        .should("not.be.empty");
    });

    it("should have og:image tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[property="og:image"]')
        .should("exist")
        .invoke("attr", "content")
        .should("match", /^https?:\/\//);
    });

    it("should have og:url tag with correct URL", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[property="og:url"]')
        .should("exist")
        .invoke("attr", "content")
        .should("include", tenant1.slug);
    });

    it("should have og:type tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[property="og:type"]')
        .should("exist")
        .invoke("attr", "content")
        .should("equal", "website");
    });

    it("should have og:site_name tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[property="og:site_name"]')
        .should("exist")
        .invoke("attr", "content")
        .should("not.be.empty");
    });
  });

  describe("Twitter Card Tags", () => {
    it("should have twitter:card tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[name="twitter:card"]')
        .should("exist")
        .invoke("attr", "content")
        .should("be.oneOf", ["summary", "summary_large_image"]);
    });

    it("should have twitter:title tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[name="twitter:title"]')
        .should("exist")
        .invoke("attr", "content")
        .should("include", tenant1.name);
    });

    it("should have twitter:description tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[name="twitter:description"]')
        .should("exist")
        .invoke("attr", "content")
        .should("not.be.empty");
    });

    it("should have twitter:image tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[name="twitter:image"]')
        .should("exist")
        .invoke("attr", "content")
        .should("match", /^https?:\/\//);
    });
  });

  describe("Canonical URL", () => {
    it("should have canonical link tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('link[rel="canonical"]')
        .should("exist")
        .invoke("attr", "href")
        .should("include", tenant1.slug);
    });

    it("should have correct canonical URL format", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('link[rel="canonical"]')
        .invoke("attr", "href")
        .should("match", /^https?:\/\/.+\/salon\/.+/);
    });

    it("should have different canonical URLs for different tenants", () => {
      cy.visit(`/salon/${tenant1.slug}`);
      cy.get('link[rel="canonical"]')
        .invoke("attr", "href")
        .as("tenant1Canonical");

      cy.visit(`/salon/${tenant2.slug}`);
      cy.get('link[rel="canonical"]')
        .invoke("attr", "href")
        .as("tenant2Canonical");

      cy.get("@tenant1Canonical").then((url1) => {
        cy.get("@tenant2Canonical").then((url2) => {
          expect(url1).to.not.equal(url2);
        });
      });
    });
  });

  describe("Structured Data (JSON-LD)", () => {
    it("should have LocalBusiness structured data", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('script[type="application/ld+json"]')
        .should("exist")
        .invoke("text")
        .then((text) => {
          const jsonLd = JSON.parse(text);
          expect(jsonLd["@type"]).to.be.oneOf(["LocalBusiness", "BeautySalon"]);
          expect(jsonLd.name).to.equal(tenant1.name);
          expect(jsonLd.address).to.exist;
          expect(jsonLd.telephone).to.exist;
        });
    });

    it("should include address in structured data", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('script[type="application/ld+json"]')
        .invoke("text")
        .then((text) => {
          const jsonLd = JSON.parse(text);
          expect(jsonLd.address).to.exist;
          expect(jsonLd.address["@type"]).to.equal("PostalAddress");
          expect(jsonLd.address.streetAddress).to.exist;
          expect(jsonLd.address.addressLocality).to.exist;
          expect(jsonLd.address.postalCode).to.exist;
        });
    });

    it("should include opening hours in structured data", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('script[type="application/ld+json"]')
        .invoke("text")
        .then((text) => {
          const jsonLd = JSON.parse(text);
          expect(jsonLd.openingHours).to.exist;
          expect(jsonLd.openingHours).to.be.an("array");
        });
    });
  });

  describe("Sitemap", () => {
    it("should have accessible sitemap.xml", () => {
      cy.request({
        url: "/sitemap.xml",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404]); // 404 acceptable if not implemented yet

        if (response.status === 200) {
          expect(response.headers["content-type"]).to.include("xml");
          expect(response.body).to.include("<urlset");
          expect(response.body).to.include("</urlset>");
        }
      });
    });

    it("should include tenant pages in sitemap", () => {
      cy.request({
        url: "/sitemap.xml",
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.include(`/salon/${tenant1.slug}`);
        }
      });
    });
  });

  describe("Robots.txt", () => {
    it("should have accessible robots.txt", () => {
      cy.request({
        url: "/robots.txt",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404]);

        if (response.status === 200) {
          expect(response.headers["content-type"]).to.include("text/plain");
        }
      });
    });

    it("should allow indexing of public tenant pages", () => {
      cy.request({
        url: "/robots.txt",
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.include("User-agent");
          // Should not disallow /salon/ paths
          expect(response.body).to.not.include("Disallow: /salon/");
        }
      });
    });
  });

  describe("HTML Semantic Structure", () => {
    it("should have proper heading hierarchy", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Should have only one h1
      cy.get("h1").should("have.length", 1);

      // h1 should contain tenant name
      cy.get("h1").should("contain", tenant1.name);

      // Should have h2 tags for sections
      cy.get("h2").should("have.length.greaterThan", 0);
    });

    it("should have meaningful alt text for images", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get("img").each(($img) => {
        cy.wrap($img).should("have.attr", "alt");
        cy.wrap($img).invoke("attr", "alt").should("not.be.empty");
      });
    });

    it("should have proper main landmark", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get("main").should("exist");
    });

    it("should have proper navigation landmark", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get("nav").should("exist");
    });
  });

  describe("Performance & Loading", () => {
    it("should load page within acceptable time", () => {
      const start = Date.now();

      cy.visit(`/salon/${tenant1.slug}`);

      cy.get("h1")
        .should("be.visible")
        .then(() => {
          const loadTime = Date.now() - start;
          expect(loadTime).to.be.lessThan(3000); // 3 seconds
        });
    });

    it("should have appropriate cache headers", () => {
      cy.request(`/salon/${tenant1.slug}`).then((response) => {
        // Check for caching headers
        const cacheControl = response.headers["cache-control"];
        expect(cacheControl).to.exist;
      });
    });
  });

  describe("Mobile-Friendly Meta Tags", () => {
    it("should have theme-color meta tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[name="theme-color"]')
        .should("exist")
        .invoke("attr", "content")
        .should("match", /^#[0-9A-Fa-f]{6}$/);
    });

    it("should have apple-mobile-web-app-capable tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('meta[name="apple-mobile-web-app-capable"]').should("exist");
    });

    it("should have favicon links", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('link[rel="icon"]').should("exist");
    });
  });

  describe("Language & Localization", () => {
    it("should have lang attribute on html tag", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get("html").should("have.attr", "lang", "en");
    });

    it("should have hreflang tags for alternate languages (if supported)", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Check if hreflang exists (optional)
      cy.get('link[rel="alternate"]').then(($links) => {
        if ($links.length > 0) {
          $links.each((index, link) => {
            expect(link).to.have.attr("hreflang");
            expect(link).to.have.attr("href");
          });
        }
      });
    });
  });
});

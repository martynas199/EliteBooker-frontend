/**
 * Live SEO verification script
 *
 * Checks key live URLs for:
 * - status code
 * - title
 * - meta description
 * - canonical URL
 * - robots directives (indexable vs noindex pages)
 * - sitemap availability
 *
 * Usage:
 *   node scripts/verifyLiveSeo.js
 *   node scripts/verifyLiveSeo.js --base=https://www.elitebooker.co.uk
 */

import {
  getProgrammaticSeoRoutes,
  getStaticSeoRoutes,
} from "../src/shared/seo/routeManifest.js";

const DEFAULT_BASE_URL = "https://www.elitebooker.co.uk";

const getRouteChecks = () => {
  const staticChecks = getStaticSeoRoutes()
    .filter((route) => route.intent !== "legal")
    .slice(0, 16)
    .map((route) => ({
      path: route.path,
      indexable: route.indexable !== false,
    }));

  const sampleProgrammatic = getProgrammaticSeoRoutes()[0];
  if (sampleProgrammatic) {
    staticChecks.push({ path: sampleProgrammatic.path, indexable: true });
  }

  return staticChecks;
};

const parseArg = (name) => {
  const value = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return value ? value.split("=")[1] : null;
};

const normalizeBaseUrl = (baseUrl) => {
  const normalized = `${baseUrl || DEFAULT_BASE_URL}`.trim();
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
};

const normalizePath = (routePath = "/") => {
  if (!routePath || routePath === "/") return "/";
  return routePath.endsWith("/") ? routePath.slice(0, -1) : routePath;
};

const buildCanonical = (baseUrl, routePath) => {
  const normalized = normalizePath(routePath);
  return normalized === "/" ? `${baseUrl}/` : `${baseUrl}${normalized}`;
};

const extractTitle = (html) => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : "";
};

const extractMetaContent = (html, attrName, attrValue) => {
  const regex = new RegExp(
    `<meta[^>]*${attrName}=["']${attrValue}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const reverseRegex = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${attrName}=["']${attrValue}["'][^>]*>`,
    "i",
  );
  const match = html.match(regex) || html.match(reverseRegex);
  return match ? match[1].trim() : "";
};

const extractCanonical = (html) => {
  const match = html.match(
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
  );
  return match ? match[1].trim() : "";
};

const getRouteResult = (route, html, status, baseUrl) => {
  const title = extractTitle(html);
  const description = extractMetaContent(html, "name", "description");
  const robots = extractMetaContent(html, "name", "robots");
  const canonical = extractCanonical(html);
  const expectedCanonical = buildCanonical(baseUrl, route.path);
  const issues = [];

  if (status < 200 || status >= 400) {
    issues.push(`Unexpected status ${status}`);
  }
  if (!title) {
    issues.push("Missing <title>");
  }
  if (!description) {
    issues.push("Missing meta description");
  }
  if (!canonical) {
    issues.push("Missing canonical");
  } else if (canonical !== expectedCanonical) {
    issues.push(`Canonical mismatch (expected: ${expectedCanonical})`);
  }

  if (!robots) {
    issues.push("Missing robots meta");
  } else {
    const robotsLower = robots.toLowerCase();
    if (route.indexable && robotsLower.includes("noindex")) {
      issues.push(`Indexable route has noindex robots: ${robots}`);
    }
    if (!route.indexable && !robotsLower.includes("noindex")) {
      issues.push(`Non-indexable route missing noindex robots: ${robots}`);
    }
  }

  return {
    path: route.path,
    status,
    ok: issues.length === 0,
    issues,
    title,
  };
};

const checkRoute = async (baseUrl, route) => {
  const response = await fetch(`${baseUrl}${route.path}`, {
    redirect: "follow",
    headers: {
      "user-agent": "elitebooker-seo-verifier/1.0",
      accept: "text/html,application/xhtml+xml",
    },
  });

  const html = await response.text();
  return getRouteResult(route, html, response.status, baseUrl);
};

const checkSitemap = async (baseUrl) => {
  const response = await fetch(`${baseUrl}/sitemap.xml`, {
    redirect: "follow",
    headers: {
      "user-agent": "elitebooker-seo-verifier/1.0",
      accept: "application/xml,text/xml,*/*",
    },
  });

  const xml = await response.text();
  const issues = [];

  if (response.status < 200 || response.status >= 400) {
    issues.push(`Unexpected status ${response.status}`);
  }
  if (!xml.includes("<urlset")) {
    issues.push("Missing <urlset> root");
  }
  if (!xml.includes(`${baseUrl}/`)) {
    issues.push("Homepage URL missing in sitemap");
  }

  const sampleProgrammaticPath = getProgrammaticSeoRoutes()[0]?.path;
  if (
    sampleProgrammaticPath &&
    !xml.includes(`${baseUrl}${sampleProgrammaticPath}`)
  ) {
    issues.push("Programmatic sample URL missing in sitemap");
  }

  return {
    path: "/sitemap.xml",
    status: response.status,
    ok: issues.length === 0,
    issues,
  };
};

const run = async () => {
  const routeChecks = getRouteChecks();
  const baseUrl = normalizeBaseUrl(parseArg("--base"));
  const routeResults = [];

  console.log(`Verifying live SEO tags against: ${baseUrl}`);

  for (const route of routeChecks) {
    try {
      const result = await checkRoute(baseUrl, route);
      routeResults.push(result);
      const statusIcon = result.ok ? "PASS" : "FAIL";
      console.log(`${statusIcon} ${route.path} (status ${result.status})`);
      if (!result.ok) {
        result.issues.forEach((issue) => console.log(`  - ${issue}`));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `${error}`;
      routeResults.push({
        path: route.path,
        status: 0,
        ok: false,
        issues: [message],
      });
      console.log(`FAIL ${route.path} (request error)`);
      console.log(`  - ${message}`);
    }
  }

  let sitemapResult;
  try {
    sitemapResult = await checkSitemap(baseUrl);
    const statusIcon = sitemapResult.ok ? "PASS" : "FAIL";
    console.log(`${statusIcon} /sitemap.xml (status ${sitemapResult.status})`);
    if (!sitemapResult.ok) {
      sitemapResult.issues.forEach((issue) => console.log(`  - ${issue}`));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    sitemapResult = {
      path: "/sitemap.xml",
      status: 0,
      ok: false,
      issues: [message],
    };
    console.log("FAIL /sitemap.xml (request error)");
    console.log(`  - ${message}`);
  }

  const allResults = [...routeResults, sitemapResult];
  const failures = allResults.filter((result) => !result.ok);

  console.log("");
  console.log(
    `SEO verification complete: ${allResults.length - failures.length}/${
      allResults.length
    } checks passed.`,
  );

  if (failures.length > 0) {
    console.log("Failed checks:");
    failures.forEach((result) => {
      console.log(`- ${result.path}`);
      result.issues.forEach((issue) => console.log(`  - ${issue}`));
    });
    process.exitCode = 1;
  }
};

run();

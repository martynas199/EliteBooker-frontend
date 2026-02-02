# Redirect Testing Guide

## What Was Fixed

### 1. **vercel.json** - Added Proper Redirects

- ✅ Permanent 301 redirect from `elitebooker.co.uk` → `www.elitebooker.co.uk`
- ✅ HTTPS is enforced automatically by Vercel
- ✅ Added security headers (X-Content-Type-Options, X-Frame-Options)

### 2. **robots.txt** - Fixed Domain References

- ✅ Updated from `.com` to `.co.uk`
- ✅ Sitemap URL now points to correct domain

### 3. **index.html** - Already Correct

- ✅ Canonical URL set to `https://www.elitebooker.co.uk/`

## Testing Steps

### After Deployment:

1. **Test HTTP → HTTPS Redirect**

   - Visit: `http://www.elitebooker.co.uk/`
   - Should redirect to: `https://www.elitebooker.co.uk/`
   - Expected: 301 or 308 redirect

2. **Test Non-WWW → WWW Redirect**

   - Visit: `http://elitebooker.co.uk/`
   - Should redirect to: `https://www.elitebooker.co.uk/`
   - Expected: 301 redirect

3. **Test HTTPS Non-WWW → WWW Redirect**

   - Visit: `https://elitebooker.co.uk/`
   - Should redirect to: `https://www.elitebooker.co.uk/`
   - Expected: 301 redirect

4. **Verify Canonical URL**
   - Visit: `https://www.elitebooker.co.uk/`
   - View source and check for: `<link rel="canonical" href="https://www.elitebooker.co.uk/" />`
   - Expected: Canonical tag present

### Using cURL Commands:

```bash
# Test non-www to www redirect
curl -I http://elitebooker.co.uk/

# Test https non-www to www
curl -I https://elitebooker.co.uk/

# Verify final destination
curl -IL http://elitebooker.co.uk/ | grep -E "(HTTP|Location)"
```

### Expected cURL Output:

```
HTTP/2 301
location: https://www.elitebooker.co.uk/

HTTP/2 200
```

## Google Search Console Actions

After deployment:

1. **Request Indexing**

   - Go to Google Search Console
   - Enter URL: `https://www.elitebooker.co.uk/`
   - Click "Request Indexing"

2. **Submit Sitemap**

   - Go to Sitemaps section
   - Add: `https://www.elitebooker.co.uk/sitemap.xml`
   - Click Submit

3. **Check URL Inspection Tool**

   - Inspect: `https://www.elitebooker.co.uk/`
   - Should show: "URL is on Google" (after reindex)
   - Coverage should be: "Indexable"

4. **Monitor Coverage Report**
   - Check for "Page with redirect" errors
   - Should resolve within 24-48 hours after deployment

## Vercel Domain Configuration

Ensure in Vercel dashboard:

1. **Domains Tab**

   - Primary: `www.elitebooker.co.uk`
   - Redirect: `elitebooker.co.uk` → `www.elitebooker.co.uk`

2. **SSL Certificate**
   - Should be active for both domains

## Common Issues

### If redirects don't work:

- Clear browser cache or test in incognito
- Wait 5-10 minutes after deployment for DNS propagation
- Check Vercel deployment logs

### If Google still shows redirect errors:

- Request re-indexing in Search Console
- Wait 24-48 hours for Google to re-crawl
- Verify robots.txt is accessible: `https://www.elitebooker.co.uk/robots.txt`

## Redirect Chain (Should Be)

```
http://elitebooker.co.uk/
  ↓ (301)
https://www.elitebooker.co.uk/
  ↓ (200)
Final Destination
```

## What NOT to Do

❌ Don't use multiple redirects (redirect chains)
❌ Don't mix www and non-www in internal links
❌ Don't change canonical URL frequently
❌ Don't have different canonical tags across pages

## What TO Do

✅ Use canonical URL consistently: `https://www.elitebooker.co.uk/`
✅ Update all internal links to use HTTPS www version
✅ Submit updated sitemap to Google
✅ Monitor Search Console for coverage improvements

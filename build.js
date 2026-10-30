#!/usr/bin/env node
/* Build step: bundles + minifies the site's CSS/JS into 3 files and stamps
   a content hash on each reference so Cloudflare/browsers never serve stale copies.
   Run after editing anything in css/ or js/:   node build.js
   (Sources stay as they are; only the *.min.* files are generated.) */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const BUNDLES = {
  "css/site.min.css": ["style", "responsive", "animations", "bmi", "testimonials"].map((n) => `css/${n}.css`),
  "js/core.min.js": ["data", "partials"].map((n) => `js/${n}.js`),
  "js/app.min.js": ["schema", "navigation", "animations", "main", "bmi", "testimonials"].map((n) => `js/${n}.js`),
};

const hashes = {};
for (const [out, sources] of Object.entries(BUNDLES)) {
  const joined = sources.map((f) => fs.readFileSync(f, "utf8")).join(out.endsWith(".css") ? "\n" : "\n;\n");
  const loader = out.endsWith(".css") ? "css" : "js";
  const min = execFileSync("npx", ["-y", "esbuild", "--minify", `--loader=${loader}`], { input: joined, maxBuffer: 1 << 26 }).toString();
  fs.writeFileSync(out, min);
  hashes[out] = crypto.createHash("md5").update(min).digest("hex").slice(0, 8);
  console.log(out, (min.length / 1024).toFixed(1) + " KB", hashes[out]);
}

const pages = ["index.html", ...fs.readdirSync(".").filter((d) => fs.existsSync(path.join(d, "index.html"))).map((d) => `${d}/index.html`)];
for (const page of pages) {
  let html = fs.readFileSync(page, "utf8");
  const before = html;
  for (const [out, h] of Object.entries(hashes)) {
    const re = new RegExp(`(${out.replace(/[.]/g, "\\.")})(\\?v=[0-9a-f]+)?`, "g");
    html = html.replace(re, `$1?v=${h}`);
  }
  if (html !== before) fs.writeFileSync(page, html);
}

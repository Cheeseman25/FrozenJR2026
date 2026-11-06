/**
 * AWS SITE OVERRIDES: only what differs when the same show is served from AWS on its own domain.
 * The build (npm run build:aws) merges this over show/show.config.js, so show text, colors and
 * pages are still edited in one place. Only the merged result is bundled, which means a value
 * blanked here (like the YouTube key) is truly absent from the AWS site's code.
 *
 * Nothing here is secret. The PIN, bridge secret and YouTube key live in AWS Parameter Store.
 */
module.exports = {
  // The Show Casts page ("shows") is enabled on the AWS site only.
  tabs: ["callboard", "cast", "shows", "costumes", "music", "videos", "calendar"],

  // Call board (login, list, save, calendar prompts) on this site's own API (AWS Lambda behind CloudFront).
  callBoardUrl: "/api/calls",

  // Choreography playlist from this site's own API. The YouTube key stays on the server.
  videosApiUrl: "/api/videos",
  youtubeApiKey: "",

  // Cast and per-show cast sheets are read through this site's own API, which holds the Google links
  // server-side (Lambda environment). The links are blanked so they are absent from the AWS site's code.
  castApiUrl: "/api/cast",
  castCsvUrl: "",
  showsApiUrl: "/api/shows",

  // Hosted with the site, so nothing depends on GitHub (the repo can go private).
  company: {
    logoUrl: "music/TTS%20Players%20Logo%20Haverhill%20Bradford.png",
  },
};

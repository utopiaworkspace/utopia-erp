// utils/env.ts
// This file is in the utils folder and is named env.ts

export const isStaging = () =>
  window.location.hostname.includes("web.app");
// This function returns true if the website address contains "web.app" (means staging environment)

export const isProduction = () =>
  window.location.hostname.includes("utopiagroup.com.my");
// This function returns true if the website address contains "utopiagroup.com.my" (means production environment)

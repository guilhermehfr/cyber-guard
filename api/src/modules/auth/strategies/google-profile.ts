import type { Profile } from "passport-google-oauth20";

import { GoogleOAuthFailureException } from "../google-oauth-error.js";

export interface GoogleIdentity {
  googleId: string;
  email: string;
  name: string;
}

export function mapGoogleProfile(profile: Profile): GoogleIdentity {
  const verifiedEmail = profile.emails?.find((email) => email.verified)?.value;

  if (!profile.id || !verifiedEmail) {
    throw new GoogleOAuthFailureException();
  }

  return {
    googleId: profile.id,
    email: verifiedEmail.toLowerCase(),
    name: profile.displayName?.trim() || profile.name?.givenName || "Player",
  };
}

import type { Profile } from "passport-google-oauth20";
import { describe, expect, it } from "vitest";

import { GoogleOAuthFailureException } from "../google-oauth-error.js";
import { mapGoogleProfile } from "./google-profile.js";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    provider: "google",
    id: "google-sub-123",
    profileUrl: "https://example.com/profile",
    _raw: "{}",
    _json: {
      iss: "https://accounts.google.com",
      aud: "test-audience",
      sub: "google-sub-123",
      iat: 1,
      exp: 2,
    },
    emails: [{ value: "user@example.com", verified: true }],
    displayName: "User Name",
    ...overrides,
  } as Profile;
}

describe("mapGoogleProfile", () => {
  it("maps the Google subject, verified email, and name", () => {
    expect(mapGoogleProfile(profile())).toEqual({
      googleId: "google-sub-123",
      email: "user@example.com",
      name: "User Name",
    });
  });

  it("lowercases the verified email", () => {
    const result = mapGoogleProfile(
      profile({ emails: [{ value: "User@Example.COM", verified: true }] }),
    );
    expect(result.email).toBe("user@example.com");
  });

  it("falls back to the given name when no display name is present", () => {
    const result = mapGoogleProfile(
      profile({ displayName: undefined, name: { givenName: "Given" } }),
    );
    expect(result.name).toBe("Given");
  });

  it("rejects a profile without an email", () => {
    expect(() => mapGoogleProfile(profile({ emails: undefined }))).toThrow(
      GoogleOAuthFailureException,
    );
  });

  it("rejects a profile with only unverified emails", () => {
    expect(() =>
      mapGoogleProfile(profile({ emails: [{ value: "user@example.com", verified: false }] })),
    ).toThrow(GoogleOAuthFailureException);
  });

  it("rejects a profile without a subject identifier", () => {
    expect(() => mapGoogleProfile(profile({ id: undefined }))).toThrow(GoogleOAuthFailureException);
  });
});

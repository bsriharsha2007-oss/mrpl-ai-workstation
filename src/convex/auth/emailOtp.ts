import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

/**
 * NOTE: this module must stay free of Node-only dependencies such as axios.
 * Convex generates a client-side `api` bundle that re-exports every function
 * file, so anything imported here (and its transitive deps) ends up in the
 * browser bundle. axios pulls in `agent-base` / `https-proxy-agent`, which are
 * Node-only and crash the Vite preview with
 * "Class extends value undefined is not a constructor or null".
 * `fetch` is available in the Convex runtime and works fine here.
 */

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string>,
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OTP send failed: ${response.status} ${text}`.trim());
  }
  return response;
}

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  async sendVerificationRequest({ identifier: email, token }) {
    try {
      await postJson(
        "https://auth.freebuff.app/send_otp",
        {
          to: email,
          otp: token,
          appName: process.env.VLY_APP_NAME || "a freebuff.com application",
        },
        {
          "x-api-key": "fb_email_2crN1hqIArZP2bEfvjp5Qik4",
        },
      );
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});

import { AuthResponse } from "@imagekit/next/server";
import axios from "axios";

const authenticator = async () => {
  try {
    // Perform the request to the upload authentication endpoint.
    const response = await axios.get<AuthResponse & { publicKey: string }>(
      "/api/upload-auth"
    );

    // Parse and destructure the response JSON for upload credentials.
    const data = response.data;
    const { signature, expire, token, publicKey } = data;
    return { signature, expire, token, publicKey };
  } catch (error) {
    // Log the original error for debugging before rethrowing a new error.
    console.error("Authentication error:", error);
    throw new Error("Authentication request failed");
  }
};

export { authenticator };

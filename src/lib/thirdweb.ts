import { createThirdwebClient } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";

const secretKey = process.env.THIRDWEB_SECRET_KEY;
const privateKey = process.env.THIRDWEB_AUTH_PRIVATE_KEY;

if (!secretKey) {
  throw new Error("No Thirdweb Secret Key provided. Please set THIRDWEB_SECRET_KEY in your .env.local file.");
}

if (!privateKey) {
  throw new Error("No Thirdweb Auth Private Key provided. Please set THIRDWEB_AUTH_PRIVATE_KEY in your .env.local file.");
}

export const serverClient = createThirdwebClient({
  secretKey: secretKey,
});

export const serverAccount = privateKeyToAccount({
  client: serverClient,
  privateKey: privateKey,
});
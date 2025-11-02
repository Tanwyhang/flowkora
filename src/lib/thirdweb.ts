// Thirdweb SDK setup
import { ThirdwebSDK } from '@thirdweb-dev/sdk'

const privateKey = process.env.THIRDWEB_AUTH_PRIVATE_KEY!

export const sdk = ThirdwebSDK.fromPrivateKey(privateKey, 'arbitrum')
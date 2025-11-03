# FlowKora

FlowKora is a decentralized payment gateway for merchants and users to transact with stablecoins on Arbitrum One. It provides a simple and secure way to accept crypto payments.

**For a comprehensive overview of the project, including core objectives, implementation plan, system architecture, and tech stack, please refer to the main project documentation: [GEMINI.md](./GEMINI.md)**

## Project Documentation

*   [GEMINI.md](./GEMINI.md) - The single source of truth for FlowKora project details.
*   [API Documentation](./docs/api.md) - Details on FlowKora's API endpoints.
*   [Schema Documentation](./docs/schema.md) - Information on database schemas.


## Installation

Install dependencies:

```bash
pnpm install
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file:

*   `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`: Your Thirdweb Client ID.
*   `THIRDWEB_SECRET_KEY`: Your Thirdweb Secret Key (for server-side operations).
*   `THIRDWEB_AUTH_PRIVATE_KEY`: Private key for server-side authentication.
*   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Project Anon Key.
*   `NEXT_PUBLIC_APP_URL`: The base URL of your application (e.g., `http://localhost:3000` or `https://your-app-domain.com`).

Refer to the [Thirdweb documentation](https://portal.thirdweb.com/typescript/v5/client) and [Supabase documentation](https://supabase.com/docs/guides/auth) for details on obtaining these keys.


## Run Locally

Start development server:

```bash
pnpm dev
```

Create a production build:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm start
```

## Resources

*   [Thirdweb Documentation](https://portal.thirdweb.com/typescript/v5)
*   [Supabase Documentation](https://supabase.com/docs/guides/platform/)

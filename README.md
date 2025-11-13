This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## API Client

A reusable Axios-based client lives in `lib/apiClient.ts` and reads its base URL from `NEXT_PUBLIC_API_URL` (defined in `.env.local`).

### Environment Variable
Set the base URL in `.env.local` (already present):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
Ensure the server you want to call is reachable from the browser.

### Basic Usage
```ts
import { apiClient } from '@/lib/apiClient';

async function loadUsers() {
  const users = await apiClient.get<User[]>('/users');
  return users;
}
```

### React Query Example
```ts
import { useQuery } from '@tanstack/react-query';
import { createQueryFetcher } from '@/lib/apiClient';

function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: createQueryFetcher<User[]>('/users'),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {(error as Error).message}</p>;
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### Error Handling
Errors are normalized into `ApiClientError` if the server responds or if a network issue occurs.
```ts
try {
  await apiClient.get('/users/123');
} catch (e) {
  if (e instanceof ApiClientError) {
    console.error(e.status, e.message, e.data);
  }
}
```

### Mutations Convenience
```ts
import { useMutation } from '@tanstack/react-query';
import { createMutationFetcher } from '@/lib/apiClient';

const useCreateUser = () =>
  useMutation({
    mutationFn: createMutationFetcher<User, Partial<User>>('/users', 'post'),
  });
```

### Pagination Type
`PaginatedResponse<T>` is exported for typical paginated endpoints.
```ts
const data = await apiClient.get<PaginatedResponse<User>>('/users?page=1');
```

import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { ClientGreeting } from "@/components/client-greeting";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function Home() {
  prefetch(trpc.hello.queryOptions({ text: "world" }));
  return (
    <HydrateClient>
      <div>Home</div>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <ClientGreeting />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}

import AppShell from "../app-shell";

export const dynamic = "force-dynamic";

export default async function RoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <AppShell initialPath={`/${slug.join("/")}`} />;
}

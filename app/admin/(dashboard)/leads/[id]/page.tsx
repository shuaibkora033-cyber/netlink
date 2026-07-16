import { LeadDetail } from "./LeadDetail";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetail id={id} />;
}

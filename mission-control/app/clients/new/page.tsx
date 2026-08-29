import { listServices } from "@/lib/services";
import { NewLeadForm } from "./NewLeadForm";

export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold text-pine-dark">New client</h1>
      <NewLeadForm services={listServices()} />
    </div>
  );
}

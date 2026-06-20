import { BrandedLoading } from "@/components/ui/branded-loading";

export default function PlanLoading() {
  return (
    <BrandedLoading
      title="Loading Plan"
      subtitle="Preparing your doctor questions, tracking tasks, and timeline."
      variant="dashboard"
    />
  );
}

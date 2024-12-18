import Documents from "@/components/Documents";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extralight text-primary my-8">
        My Documents
      </h1>
      {/* documents */}
      <Documents />
    </div>
  );
}

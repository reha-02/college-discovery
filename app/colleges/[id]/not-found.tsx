// app/colleges/[id]/not-found.tsx
import Link from "next/link";

export default function CollegeNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🏫</div>
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">College not found</h1>
        <p className="text-gray-500 mb-6">This college doesn&apos;t exist or may have been removed.</p>
        <Link href="/colleges" className="btn-primary">
          Browse All Colleges
        </Link>
      </div>
    </div>
  );
}

/** Shown while an admin page loads its data. */
export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 bg-line-soft" />
      <div className="h-4 w-96 max-w-full bg-line-soft" />
      <div className="mt-8 h-64 border border-line bg-white" />
    </div>
  );
}

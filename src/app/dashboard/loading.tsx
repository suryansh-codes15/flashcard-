export default function DashboardLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 w-48 skeleton rounded-lg mb-2" />
        <div className="h-4 w-32 skeleton rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="w-10 h-10 skeleton rounded-xl mx-auto mb-3" />
              <div className="h-6 w-12 skeleton rounded mx-auto mb-1" />
              <div className="h-3 w-16 skeleton rounded mx-auto" />
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="h-11 w-full skeleton rounded-xl mb-4" />
              <div className="h-4 w-3/4 skeleton rounded mb-2" />
              <div className="h-3 w-1/2 skeleton rounded mb-4" />
              <div className="h-2 w-full skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

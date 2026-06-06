import Link from "next/link";

const stats = [
  { label: "Top colleges", value: "60+" },
  { label: "Indian cities", value: "12" },
  { label: "Verified reviews", value: "300+" },
  { label: "Compare shortlist", value: "3 at once" },
];

const categories = ["Engineering", "Management", "Science", "Design", "Law", "Commerce"];

export default function HomePage() {
  return (
    <div className="bg-gray-50">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,82,231,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(0,201,167,0.10),_transparent_34%)]" />
        <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="badge bg-brand-50 text-brand-700">CollegeFinder India</div>
            <h1 className="mt-5 max-w-3xl text-4xl font-display font-bold leading-tight text-gray-950 md:text-6xl">
              Discover the right college for your future.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              Explore top colleges across India, compare fees and ratings, save your shortlist, and make a confident admission decision.
            </p>

            <form action="/colleges" className="mt-8 rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    name="search"
                    className="input-base h-14 pl-12 text-base"
                    placeholder="Search colleges, cities, courses..."
                  />
                </div>
                <button className="btn-primary h-14 justify-center px-7">Search</button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link key={category} href={`/colleges?search=${encodeURIComponent(category)}`} className="badge border border-brand-100 bg-white text-brand-700 hover:bg-brand-50">
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-5">
              <p className="text-3xl font-display font-bold text-gray-950">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[
          ["Browse colleges", "Filter by city, fees, rating, and course fit.", "/colleges"],
          ["Compare options", "Put colleges side by side before deciding.", "/compare"],
          ["Save shortlist", "Keep your favorite colleges in one place.", "/saved"],
        ].map(([title, text, href]) => (
          <Link key={title} href={href} className="card p-6 hover:-translate-y-0.5">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-bold text-gray-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{text}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-brand-950 p-8 text-white">
              <p className="text-sm font-semibold text-brand-200">Admission planning</p>
              <h2 className="mt-2 text-3xl font-display font-bold">Move from search to decision faster.</h2>
              <p className="mt-4 leading-7 text-brand-100">
                Build a shortlist, compare the important numbers, and keep your choices organized before counselling starts.
              </p>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              {["Search", "Compare", "Apply"].map((step, index) => (
                <div key={step} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-4 grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{index + 1}</div>
                  <h3 className="font-semibold text-gray-950">{step}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {index === 0 && "Find colleges by city, course, rating, and budget."}
                    {index === 1 && "Review fees, courses, placements, and location."}
                    {index === 2 && "Save your final choices and track next steps."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

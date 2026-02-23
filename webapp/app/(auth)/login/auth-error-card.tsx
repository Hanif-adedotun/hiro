export function AuthErrorCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-left"
    >
      <div className="flex gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"
          aria-hidden
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-900">{title}</p>
          <p className="mt-1 text-sm text-amber-800/90">{description}</p>
        </div>
      </div>
    </div>
  )
}

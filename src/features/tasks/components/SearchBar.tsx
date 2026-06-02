import React from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

function SearchBar({ onChange, value }: SearchBarProps) {
  // Pure input component: memoize so it only re-renders when `value`
  // or `onChange` identity actually changes. Parent should pass a
  // stable `onChange` (we provide that from `Dashboard`).
  return (
    <label className="block">
      <span className="sr-only">Search tasks</span>
      <input
        className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value)
        }}
        placeholder="Search by title or description"
        type="search"
        value={value}
      />
    </label>
  )
}

export default React.memo(SearchBar)

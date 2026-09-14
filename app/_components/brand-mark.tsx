"use client"

export default function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <div aria-hidden="true" className="link-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={Math.round(size * 0.68)} height={Math.round(size * 0.68)} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 22.8 10.9 19.2a7.4 7.4 0 0 1 10.5-10.5l3.2 3.2" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m25.5 17.2 3.6 3.6a7.4 7.4 0 0 1-10.5 10.5l-3.2-3.2" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m15.5 24.5 9-9" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" />
      </svg>
      <span className="link-mark-dot" />
    </div>
  )
}

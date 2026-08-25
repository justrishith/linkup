export default function BrandMark({ size = 40 }: { size?: number }) {
  return <div aria-hidden="true" className="grid shrink-0 place-items-center rounded-[14px] border-2 border-[#1a1a1a] bg-brand-blue shadow-[4px_4px_0_#1a1a1a]" style={{ width: size, height: size }}>
    <svg viewBox="0 0 40 40" width={Math.round(size * .62)} height={Math.round(size * .62)} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5 12.5 10 16l7 7 10-10 3.5 3.5-10 10-7-7-5.5 5.5" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26.5 27.5 30 24l-7-7-10 10-3.5-3.5 10-10 7 7 5.5-5.5" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
}

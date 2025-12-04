export default function BackBar({ onBack, label = "Back", className = "" }) {
  return (
    <div className={["max-w-2xl mx-auto", className].join(" ")}> 
      <button
        className="text-white/80 hover:text-white inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-all group"
        onClick={onBack}
        type="button"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-semibold">{label}</span>
      </button>
    </div>
  );
}


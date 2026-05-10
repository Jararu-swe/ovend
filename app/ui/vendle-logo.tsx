export default function VendleLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`} style={{ fontFamily: 'var(--font-pacifico), cursive' }}>
      <span className="text-3xl text-emerald-600 leading-none">V</span>
      <span className="text-2xl text-emerald-600 leading-none tracking-tight">endle</span>
    </div>
  );
}

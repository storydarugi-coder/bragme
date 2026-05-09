const ITEMS = [
  { icon: "🚫", label: "No signup" },
  { icon: "🤐", label: "100% anonymous" },
  { icon: "🆓", label: "Free forever" },
  { icon: "✨", label: "AI-crafted" },
];

export function TrustStrip() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
      {ITEMS.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span aria-hidden>{item.icon}</span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

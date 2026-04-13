export default function WipTabs({ view, setView }: any) {
  const tabs = [
    { key: "product", label: "Product List" },
    { key: "incoming", label: "Incoming" },
    { key: "outgoing", label: "Outgoing" },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setView(t.key)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            view === t.key
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
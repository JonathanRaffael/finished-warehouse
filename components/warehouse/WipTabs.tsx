type WipView = "product" | "incoming" | "outgoing";

interface Props {
  view: WipView;
  setView: (view: WipView) => void;
}

const TABS: { key: WipView; label: string }[] = [
  { key: "product", label: "Product List" },
  { key: "incoming", label: "Incoming" },
  { key: "outgoing", label: "Outgoing" },
];

export default function WipTabs({ view, setView }: Props) {
  return (
    <div className="flex gap-2">
      {TABS.map((t) => {
        const active = view === t.key;

        return (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }
            `}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
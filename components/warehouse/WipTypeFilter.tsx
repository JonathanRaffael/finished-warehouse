export default function WipTypeFilter({ type, setType }: any) {
  return (
    <div className="flex gap-2">
      {["HT", "HK"].map((t) => (
        <button
          key={t}
          onClick={() => setType(t)}
          className={`px-4 py-2 rounded-md text-sm font-semibold ${
            type === t
              ? "bg-green-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
type WipType = "HT" | "HK";

interface Props {
  type: WipType;
  setType: (type: WipType) => void;
}

const TYPES: WipType[] = ["HT", "HK"];

export default function WipTypeFilter({ type, setType }: Props) {
  return (
    <div className="flex gap-2">
      {TYPES.map((t) => {
        const active = type === t;

        return (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200
              ${
                active
                  ? "bg-green-600 text-white shadow-md scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }
            `}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
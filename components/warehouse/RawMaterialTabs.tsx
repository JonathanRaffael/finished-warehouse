"use client";

type ViewType =
  | "monitoring"
  | "incoming"
  | "usage"
  | "master";

type Props = {
  view: ViewType;
  setView: (
    view: ViewType
  ) => void;
};

const tabs = [
  {
    key: "monitoring",
    label: "Monitoring",
  },
  {
    key: "incoming",
    label: "Incoming Material",
  },
  {
    key: "usage",
    label: "Material Usage",
  },
  {
    key: "master",
    label: "Master Material",
  },
] as const;

export default function RawMaterialTabs({
  view,
  setView,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">

      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() =>
            setView(tab.key)
          }
          className={`px-4 py-2 rounded-lg text-sm font-medium transition
            ${
              view === tab.key
                ? "bg-slate-900 text-white"
                : "border hover:bg-slate-50"
            }`}
        >
          {tab.label}
        </button>
      ))}

    </div>
  );
}
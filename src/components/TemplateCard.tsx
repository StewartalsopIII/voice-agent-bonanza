interface TemplateCardProps {
  icon: string;
  name: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export default function TemplateCard({
  icon,
  name,
  description,
  selected,
  onClick,
}: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );
}

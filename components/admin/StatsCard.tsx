interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <div className={`card ${color} text-white p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70 font-medium">{title}</p>
          <p className="text-3xl font-extrabold mt-2">{value}</p>
        </div>
        <span className="text-4xl opacity-50">{icon}</span>
      </div>
    </div>
  );
}

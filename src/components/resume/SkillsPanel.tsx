import { skills } from '../../content/skills';

export default function SkillsPanel() {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {skills.map((cat) => (
        <div key={cat.name}>
          <dt className="text-sm font-semibold text-[#8ee9ef]">{cat.name}</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {cat.items.map((item) => (
              <span
                key={item}
                className="rounded border border-[#363c53] bg-[#1e1a30] px-2 py-0.5 text-xs text-[#d7cfbd]"
              >
                {item}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

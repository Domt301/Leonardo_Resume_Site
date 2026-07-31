import { certifications } from '../../content/certifications';

export default function CertificationsPanel() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {certifications.map((c) => (
        <li key={c.id} className="rounded border border-[#363c53] bg-[#131022] p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#f6efdd]">{c.name}</h3>
            {c.status === 'lapsed' && (
              <span className="shrink-0 rounded bg-[#7a2029]/40 px-1.5 py-0.5 text-[10px] uppercase text-[#ee9297]">
                lapsed
              </span>
            )}
          </div>
          <p className="text-xs text-[#96a8ff]">{c.issuer}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#b6a78d]">{c.description}</p>
        </li>
      ))}
    </ul>
  );
}

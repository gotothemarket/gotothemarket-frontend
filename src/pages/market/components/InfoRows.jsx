// components/InfoRows.jsx
export default function InfoRows({ title, rows, onEdit }) {
  return (
    <section className=" px-[1.5rem]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-sm text-main-1000">
            수정하기
          </button>
        )}
      </div>
      <div className="space-y-3 bg-gray-50 rounded-[1rem] p-4">
        {rows.map(({ label, value }, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-gray-600">{label}</span>
            <span className="text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// components/InfoRows.jsx
export default function InfoRows({ title, rows, onEdit }) {
  return (
    <section className=" px-[1.5rem]">
      <div className="flex justify-between items-center mb-4">
        <h3
          style={{
            color: '#0A0A0A',
            fontFamily: 'Pretendard Variable',
            fontSize: '1.6rem',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
          }}
        >
          {title}
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              color: '#FF9C1F',
              textAlign: 'right',
              fontFamily: 'Pretendard Variable',
              fontSize: '1.2rem',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
            }}
          >
            수정하기
          </button>
        )}
      </div>
      <div
        className="space-y-3 bg-gray-50 rounded-[1rem]"
        style={{
          padding: '2rem 3.5rem 2rem 3.5rem',
        }}
      >
        {rows.map(({ label, value }, i) => (
          <div key={i} className="flex justify-between">
            <span
              style={{
                color: '#0A0A0A',
                fontFamily: 'Pretendard Variable',
                fontSize: '1.2rem',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
              }}
            >
              {label}
            </span>
            <span
              style={{
                color: '#0A0A0A',
                textAlign: 'right',
                fontFamily: 'Pretendard Variable',
                fontSize: '1.2rem',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

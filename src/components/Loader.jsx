function Loader({ text = 'Loading...' }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-center shadow-sm">
      <p className="text-slate-300">{text}</p>
    </div>
  );
}

export default Loader;

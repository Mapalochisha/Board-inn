export function UnitTypeTag({ type }: { type: 'full_room' | 'bed_space' }) {
  if (type === 'full_room') {
    return (
      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
        Full Room
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-sky-100 text-sky-700">
      Bed Space
    </span>
  );
}

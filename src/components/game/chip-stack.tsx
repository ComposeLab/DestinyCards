'use client';

interface ChipStackProps {
  amount: number;
  size?: 'sm' | 'md';
}

export function ChipStack({ amount, size = 'md' }: ChipStackProps) {
  const isSmall = size === 'sm';
  return (
    <div className="flex items-center gap-1.5">
      <div className={`${isSmall ? 'w-6 h-6' : 'w-7 h-7'} rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300 flex items-center justify-center shadow-md`}>
        <span className={`${isSmall ? 'text-[8px]' : 'text-[10px]'} font-bold text-amber-900`}>$</span>
      </div>
      <span className={`text-amber-400 font-bold ${isSmall ? 'text-sm' : 'text-lg'}`}>{amount}</span>
    </div>
  );
}

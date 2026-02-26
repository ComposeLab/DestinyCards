interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const badgeVariants = {
  default: 'bg-gray-700 text-gray-300',
  success: 'bg-green-900/50 text-green-400 border border-green-800',
  warning: 'bg-amber-900/50 text-amber-400 border border-amber-800',
  danger: 'bg-red-900/50 text-red-400 border border-red-800',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]}`}>
      {children}
    </span>
  );
}

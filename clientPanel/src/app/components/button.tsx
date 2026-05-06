import { isValidElement, MouseEvent, ReactNode, useState } from 'react';
import { CheckCircle, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { getActionCompletedLabel, inferClientAction, runClientAction } from '../lib/client-actions';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  children,
  icon: Icon,
  onClick,
  className,
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const [completedLabel, setCompletedLabel] = useState<string | null>(null);

  const variants = {
    primary: 'bg-[#AAFF01] text-black hover:bg-[#AAFF01]/90 shadow-[0_0_20px_rgba(170,255,1,0.2)] hover:shadow-[0_0_30px_rgba(170,255,1,0.3)]',
    secondary: 'bg-transparent border border-white/[0.08] text-white hover:bg-white/[0.05] hover:border-[#AAFF01]/30',
    danger: 'bg-[#ff4444] text-white hover:bg-[#ff4444]/90',
    ghost: 'bg-transparent text-[#A0A0A0] hover:text-white hover:bg-white/[0.05]',
  };

  const label = getNodeText(children);
  const isAutoAction = !onClick;
  const DisplayIcon = completedLabel ? CheckCircle : Icon;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    if (onClick) {
      onClick();
      return;
    }

    event.preventDefault();
    const actionType = inferClientAction(label);
    runClientAction(label, actionType);
    setCompletedLabel(getActionCompletedLabel(actionType, label));
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60',
        completedLabel && 'ring-1 ring-[#AAFF01]/30',
        variants[variant],
        className
      )}
    >
      {DisplayIcon && <DisplayIcon className="w-4 h-4" />}
      {isAutoAction && completedLabel ? completedLabel : children}
    </button>
  );
}

function getNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join(' ').trim();
  if (isValidElement<{ children?: ReactNode }>(node)) return getNodeText(node.props.children);
  return 'İşlem';
}

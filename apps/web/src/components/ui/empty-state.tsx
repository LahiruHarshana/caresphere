import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      {action && (
        action.href ? (
          <a href={action.href} className="inline-flex items-center bg-primary text-white px-6 py-2.5 rounded-lg font-medium">
            {action.label}
          </a>
        ) : (
          <button onClick={action.onClick} className="inline-flex items-center bg-primary text-white px-6 py-2.5 rounded-lg font-medium">
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

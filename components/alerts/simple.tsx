import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx/lite';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

function Icon({ type }: { type: AlertType }) {
  switch (type) {
    case 'info':
      return <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />;
    case 'success':
      return <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />;
    case 'error':
      return <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />;
  }
}

export default function SimpleAlert({
  type,
  title,
  className,
  children,
}: {
  type: AlertType;
  title: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const color = {
    bg: '',
    title: '',
    children: '',
  };

  switch (type) {
    case 'info':
      color.bg = 'bg-blue-50';
      color.title = 'text-blue-800';
      color.children = 'text-blue-700';
      break;
    case 'success':
      color.bg = 'bg-green-50';
      color.title = 'text-green-800';
      color.children = 'text-green-700';
      break;
    case 'warning':
      color.bg = 'bg-yellow-50';
      color.title = 'text-yellow-800';
      color.children = 'text-yellow-700';
      break;
    case 'error':
      color.bg = 'bg-red-50';
      color.title = 'text-red-800';
      color.children = 'text-red-700';
      break;
  }

  return (
    <div className={clsx('rounded-md p-4', className, color.bg)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon type={type} />
        </div>
        <div className="ml-3">
          <h3 className={clsx('text-sm font-medium', color.title)}>{title}</h3>
          {children && <div className={clsx('mt-2 text-sm', color.children)}>{children}</div>}
        </div>
      </div>
    </div>
  );
}

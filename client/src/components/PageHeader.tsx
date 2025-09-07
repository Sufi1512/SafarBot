import React from 'react';
import Breadcrumb from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs = true,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="container-chisfis py-8 sm:py-12">
        <div className="max-w-4xl">
          {breadcrumbs && (
            <Breadcrumb className="mb-4" />
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                {title}
              </h1>
              {description && (
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            
            {children && (
              <div className="flex-shrink-0">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

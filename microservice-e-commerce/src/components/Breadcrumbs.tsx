import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbNode {
  label: string;
  view?: 'home' | 'products' | 'detail';
}

interface BreadcrumbsProps {
  paths: BreadcrumbNode[];
  onNavigate: (view: 'home' | 'products' | 'detail') => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ paths, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 select-none">
      <ol className="flex flex-wrap items-center space-x-2 text-on-surface-variant dark:text-tertiary-fixed-dim/60 font-body-sm text-body-sm">
        {paths.map((node, index) => {
          const isLast = index === paths.length - 1;

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <li className="flex items-center opacity-50">
                  <ChevronRight className="w-3.5 h-3.5" />
                </li>
              )}
              
              <li>
                {isLast || !node.view ? (
                  <span 
                    className={`font-semibold ${
                      isLast 
                        ? 'text-primary dark:text-primary-fixed' 
                        : 'text-on-surface-variant dark:text-tertiary-fixed-dim/60'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {node.label}
                  </span>
                ) : (
                  <button
                    onClick={() => onNavigate(node.view!)}
                    className="hover:text-primary dark:hover:text-primary-fixed transition-colors focus:outline-none cursor-pointer underline decoration-dotted decoration-outline-variant hover:decoration-solid"
                  >
                    {node.label}
                  </button>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { Badge } from '../common/Badge.jsx';
import { SEO } from '../common/SEO.jsx';

export function ToolLayout({
  title,
  description,
  category = 'Utilities',
  badgeVariant = 'brand',
  icon: Icon = Sparkles,
  seoTitle = null,
  seoDescription = null,
  children
}) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO
        title={seoTitle || `${title} - Universal Media Toolkit`}
        description={seoDescription || description}
      />

      {/* Header & Breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            to={ROUTES.TOOLS}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Media Toolbox
          </Link>

          <Badge variant={badgeVariant} size="sm">
            {category}
          </Badge>
        </div>

        <div className="text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
            <Icon className="w-7 h-7" />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tool Content */}
      <div className="pt-2">{children}</div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Image as ImageIcon, TrendingDown, Sliders, ArrowRight, ShieldCheck } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ROUTES } from '../../constants/routes.js';

export function ImageTools() {
  const imageToolsList = [
    {
      title: 'Image Converter',
      path: ROUTES.TOOLS_IMAGE_CONVERT || '/tools/image/convert',
      icon: ImageIcon,
      gradient: 'from-blue-500 to-indigo-600',
      badge: 'Popular',
      description: 'Convert local photos and graphics between JPG, PNG, modern WebP, and ultra-compact AVIF formats.'
    },
    {
      title: 'Image Compressor',
      path: ROUTES.TOOLS_IMAGE_COMPRESS || '/tools/image/compress',
      icon: TrendingDown,
      gradient: 'from-purple-500 to-pink-600',
      badge: 'High Reduction',
      description: 'Reduce image file size significantly with lossless or visual quality compression. See live before/after size reductions.'
    },
    {
      title: 'Image Resizer',
      path: ROUTES.TOOLS_IMAGE_RESIZE || '/tools/image/resize',
      icon: Sliders,
      gradient: 'from-emerald-500 to-teal-600',
      badge: 'Fast',
      description: 'Resize image dimensions while strictly maintaining original aspect ratio. Standard presets available from 720px up to 1920px.'
    },
    {
      title: 'HD Thumbnail Extractor',
      path: ROUTES.TOOLS_THUMBNAIL,
      icon: ImageIcon,
      gradient: 'from-amber-500 to-rose-600',
      badge: 'URL Tool',
      description: 'Extract and download maximum resolution original cover images from YouTube, Instagram Reels, and Facebook.'
    }
  ];

  return (
    <ToolLayout
      title="Image Processing Suite"
      description="Client and server-side image utilities powered by high-performance Sharp image processing."
      icon={ImageIcon}
      category="Image Tools"
    >
      <div className="space-y-8">
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {imageToolsList.map((t) => {
            const Icon = t.icon;
            return (
              <Card
                key={t.title}
                className="p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex flex-col justify-between group hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${t.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="brand" size="sm">
                      {t.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Link to={t.path}>
                    <Button variant="outline" size="sm" className="w-full font-bold justify-center">
                      Launch Tool <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Feature Banner */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Privacy & Security Guaranteed</h4>
              <p className="text-xs text-slate-400">
                All processed images are temporary and deleted immediately after download or 10-minute expiry.
              </p>
            </div>
          </div>
          <Link to={ROUTES.PRIVACY}>
            <Button size="sm" variant="outline" className="text-xs shrink-0 bg-slate-800 text-white border-slate-700">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}

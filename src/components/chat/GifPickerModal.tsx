import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

interface GifPickerModalProps {
  onClose: () => void;
  onSelectGif: (url: string) => void;
}

const CURATED_GIFS = [
  {
    title: 'Hacker typing',
    category: 'tech',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Cat vibing',
    category: 'vibe',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Neon city night',
    category: 'cyber',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Coffee focus',
    category: 'chill',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Synthwave sunset',
    category: 'cyber',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Space galaxy',
    category: 'vibe',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Celebration confetti',
    category: 'party',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Matrix code rain',
    category: 'tech',
    url: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=400&q=80',
  },
];

export const GifPickerModal: React.FC<GifPickerModalProps> = ({
  onClose,
  onSelectGif,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = CURATED_GIFS.filter((g) => {
    const matchesCat = category === 'all' || g.category === category;
    const matchesQ =
      !query ||
      g.title.toLowerCase().includes(query.toLowerCase()) ||
      g.category.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQ;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-[#0b1120] border border-cyan-500/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3 border-b border-cyan-950 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200">GIFs & Visual Drops</span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-cyan-950/60">
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-500/70 absolute left-3 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GIFs & vibes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-cyan-900/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 text-[11px]">
            {['all', 'tech', 'cyber', 'vibe', 'party', 'chill'].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-2.5 py-0.5 rounded-full capitalize transition-colors ${
                  category === c
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2">
          {filtered.map((g, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectGif(g.url);
                onClose();
              }}
              className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-400/80 cursor-pointer aspect-video bg-slate-900 transition-all hover:scale-[1.02]"
            >
              <img
                src={g.url}
                alt={g.title}
                className="w-full h-full object-cover group-hover:opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                <span className="text-[10px] font-medium text-slate-200 truncate block">
                  {g.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

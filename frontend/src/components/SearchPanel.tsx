import { useState } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';

interface SearchFilters {
  searchText: string;
  fishTypes: string[];
  locations: string[];
  priceRange: [number, number];
}

interface SearchPanelProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onClose: () => void;
  resultsCount?: number;
  totalCount?: number;
}

const FISH_CATEGORIES = [
  { name: 'All Fish', color: '#ffffff', families: [] },
  { name: 'Tuna & Mackerel', color: '#2c3e50', families: ['Scombridae', 'Thunnus', 'Katsuwonus', 'Euthynnus', 'Gymnosarda'] },
  { name: 'Surgeonfish', color: '#4a90e2', families: ['Acanthuridae', 'Acanthurus'] },
  { name: 'Damselfish', color: '#50c878', families: ['Pomacentridae', 'Abudefduf', 'Chromis', 'Dascyllus'] },
  { name: 'Clownfish', color: '#ff8c42', families: ['Amphiprion'] },
  { name: 'Groupers', color: '#9b59b6', families: ['Serranidae', 'Epinephelus', 'Cephalopholis'] },
  { name: 'Wrasses', color: '#1abc9c', families: ['Labridae', 'Anampses', 'Cheilinus'] },
  { name: 'Angelfish', color: '#e74c3c', families: ['Pomacanthidae', 'Centropyge'] },
  { name: 'Gobies', color: '#f39c12', families: ['Gobiidae', 'Amblygobius'] },
  { name: 'Pufferfish', color: '#3498db', families: ['Tetraodontidae', 'Arothron', 'Canthigaster'] },
  { name: 'Triggerfish', color: '#e67e22', families: ['Balistidae', 'Balistoides'] },
  { name: 'Sharks & Rays', color: '#95a5a6', families: ['Carcharhinidae', 'Carcharhinus', 'Dasyatidae'] },
  { name: 'Corals', color: '#ff6b6b', families: ['Scleractinia', 'Acropora', 'Fungia', 'Porites'] },
  { name: 'Copepods', color: '#ffd700', families: ['Copepoda', 'Calanus', 'Acartia'] },
  { name: 'Invertebrates', color: '#c0392b', families: ['Echinoidea', 'Holothuroidea', 'Asteroidea'] },
];

const REGIONS = [
  'All Regions',
  'Western Pacific',
  'Indian Ocean',
  'South China Sea',
  'Coral Sea',
  'East China Sea',
  'Philippine Sea',
];

export default function SearchPanel({ onFiltersChange, onClose, resultsCount = 0, totalCount = 0 }: SearchPanelProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [showCategories, setShowCategories] = useState(false);
  const [showRegions, setShowRegions] = useState(false);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    applyFilters({ searchText: text });
  };

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    applyFilters({ fishTypes: newCategories });
  };

  const toggleRegion = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];
    setSelectedRegions(newRegions);
    applyFilters({ locations: newRegions });
  };

  const applyFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({
      searchText: updates.searchText ?? searchText,
      fishTypes: updates.fishTypes ?? selectedCategories,
      locations: updates.locations ?? selectedRegions,
      priceRange: updates.priceRange ?? priceRange,
    });
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategories([]);
    setSelectedRegions([]);
    setPriceRange([0, 100]);
    onFiltersChange({
      searchText: '',
      fishTypes: [],
      locations: [],
      priceRange: [0, 100],
    });
  };

  const hasActiveFilters = searchText || selectedCategories.length > 0 || selectedRegions.length > 0;

  return (
    <div className="fixed top-20 left-6 w-96 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-40 max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white">Search & Filter</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-white/60">Showing:</span>
            <span className="font-semibold text-white">{resultsCount.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/60">Total:</span>
            <span className="font-semibold text-white">{totalCount.toLocaleString()}</span>
          </div>
          {resultsCount < totalCount && (
            <>
              <div className="w-px h-4 bg-white/20"></div>
              <span className="text-xs text-blue-400">
                {((resultsCount / totalCount) * 100).toFixed(1)}% filtered
              </span>
            </>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐟</span>
            <span className="text-sm text-blue-100">Showing all fish species</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by scientific or common name..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
          >
            <span className="text-white font-medium">
              Fish Type {selectedCategories.length > 0 && `(${selectedCategories.length})`}
            </span>
            <ChevronDown className={`w-4 h-4 text-white transition-transform ${showCategories ? 'rotate-180' : ''}`} />
          </button>

          {showCategories && (
            <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
              {FISH_CATEGORIES.map((category) => (
                <button
                  key={category.name}
                  onClick={() => toggleCategory(category.name)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                    selectedCategories.includes(category.name)
                      ? 'bg-white/20 border border-white/30'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-white text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Region Filter */}
        <div>
          <button
            onClick={() => setShowRegions(!showRegions)}
            className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
          >
            <span className="text-white font-medium">
              Region {selectedRegions.length > 0 && `(${selectedRegions.length})`}
            </span>
            <ChevronDown className={`w-4 h-4 text-white transition-transform ${showRegions ? 'rotate-180' : ''}`} />
          </button>

          {showRegions && (
            <div className="mt-2 space-y-1">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`w-full text-left p-2.5 rounded-lg transition-all ${
                    selectedRegions.includes(region)
                      ? 'bg-white/20 border border-white/30 text-white'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{region}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium text-sm">Price Range</span>
            <span className="text-white/60 text-sm">
              ${priceRange[0]} - ${priceRange[1]}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={priceRange[0]}
              onChange={(e) => {
                const newRange: [number, number] = [parseInt(e.target.value), priceRange[1]];
                setPriceRange(newRange);
                applyFilters({ priceRange: newRange });
              }}
              className="flex-1"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={priceRange[1]}
              onChange={(e) => {
                const newRange: [number, number] = [priceRange[0], parseInt(e.target.value)];
                setPriceRange(newRange);
                applyFilters({ priceRange: newRange });
              }}
              className="flex-1"
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-xs font-medium">ACTIVE FILTERS</span>
              <button
                onClick={clearFilters}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchText && (
                <div className="px-2 py-1 bg-blue-500/30 border border-blue-400/50 rounded-md text-xs text-white flex items-center gap-1">
                  <span>"{searchText}"</span>
                  <button onClick={() => handleSearchChange('')}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedCategories.map((cat) => (
                <div key={cat} className="px-2 py-1 bg-green-500/30 border border-green-400/50 rounded-md text-xs text-white flex items-center gap-1">
                  <span>{cat}</span>
                  <button onClick={() => toggleCategory(cat)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {selectedRegions.map((reg) => (
                <div key={reg} className="px-2 py-1 bg-purple-500/30 border border-purple-400/50 rounded-md text-xs text-white flex items-center gap-1">
                  <span>{reg}</span>
                  <button onClick={() => toggleRegion(reg)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

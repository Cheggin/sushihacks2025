import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import type { FishOccurrence } from '../types/fish';

interface FishPriceData {
  'Fish Name': string;
  'Jul 2024': string;
  'Aug 2024': string;
  'Sep 2024': string;
  'Oct 2024': string;
  'Nov 2024': string;
  'Dec 2024': string;
  'Jan 2025': string;
  'Feb 2025': string;
  'Mar 2025': string;
  'Apr 2025': string;
  'May 2025': string;
  'Jun 2025': string;
  'Jul 2025': string;
  [key: string]: string; // Index signature for dynamic access
}

interface FishSidebarProps {
  fish: FishOccurrence | null;
  onClose: () => void;
}

// Generate price data from CSV or fallback to mock data
const generatePriceHistory = (scientificName: string, priceData: FishPriceData[]) => {
  // Try to find the fish in the real price data
  const fishRow = priceData.find(row => row['Fish Name'].includes(scientificName));

  if (fishRow) {
    // Real data found, format it to show Jul 2024 - Jun 2025, converting from per 100g to per lb
    const convertTo100gToLb = (price: string) => parseFloat((parseFloat(price) * 4.53592).toFixed(2));
    return [
      { month: 'Jul', price: convertTo100gToLb(fishRow['Jul 2024']) },
      { month: 'Aug', price: convertTo100gToLb(fishRow['Aug 2024']) },
      { month: 'Sep', price: convertTo100gToLb(fishRow['Sep 2024']) },
      { month: 'Oct', price: convertTo100gToLb(fishRow['Oct 2024']) },
      { month: 'Nov', price: convertTo100gToLb(fishRow['Nov 2024']) },
      { month: 'Dec', price: convertTo100gToLb(fishRow['Dec 2024']) },
      { month: 'Jan', price: convertTo100gToLb(fishRow['Jan 2025']) },
      { month: 'Feb', price: convertTo100gToLb(fishRow['Feb 2025']) },
      { month: 'Mar', price: convertTo100gToLb(fishRow['Mar 2025']) },
      { month: 'Apr', price: convertTo100gToLb(fishRow['Apr 2025']) },
      { month: 'May', price: convertTo100gToLb(fishRow['May 2025']) },
      { month: 'Jun', price: convertTo100gToLb(fishRow['Jun 2025']) }
    ];
  }

  // Fallback to mock data if fish not found in price data
  let hash = 0;
  for (let i = 0; i < scientificName.length; i++) {
    hash = ((hash << 5) - hash) + scientificName.charCodeAt(i);
    hash = hash & hash;
  }
  const basePrice = 20 + Math.abs(hash % 50);
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return months.map((month, index) => {
    const monthHash = Math.abs((hash + index * 7) % 20);
    const variation = (monthHash / 20 - 0.5) * 20;
    return {
      month,
      price: parseFloat((basePrice + variation).toFixed(2))
    };
  });
};

interface PricePrediction {
  price: number;
  trend: string; // e.g., "+3.2% upward" or "-1.5% downward"
}

const getLastPrice = (scientificName: string, priceData: FishPriceData[]): PricePrediction => {
  const fishRow = priceData.find(row => row['Fish Name'].includes(scientificName));

  if (fishRow) {
    const months = [
      'Jul 2024','Aug 2024','Sep 2024','Oct 2024','Nov 2024','Dec 2024',
      'Jan 2025','Feb 2025','Mar 2025','Apr 2025','May 2025','Jun 2025'
    ];
    const prices = months
      .map(month => parseFloat(fishRow[month] || '0') * 4.53592)
      .filter(p => !isNaN(p) && p > 0);

    if (prices.length === 0) return { price: 0, trend: '0% no change' };

    // Weighted average for predicted price
    const weightedSum = prices.reduce((sum, price, i) => sum + price * (i + 1), 0);
    const weightTotal = prices.reduce((sum, _, i) => sum + (i + 1), 0);
    const predictedPrice = parseFloat((weightedSum / weightTotal).toFixed(2));

    // Trend calculation: percentage difference between last month and first month
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const trendPct = ((lastPrice - firstPrice) / firstPrice) * 100;
    const trendStr = `${trendPct >= 0 ? '+' : ''}${trendPct.toFixed(1)}% ${trendPct >= 0 ? 'upward' : 'downward'}`;

    return { price: predictedPrice, trend: trendStr };
  }

  // Fallback: hash mock
  let hash = 0;
  for (let i = 0; i < scientificName.length; i++) {
    hash = ((hash << 5) - hash) + scientificName.charCodeAt(i);
    hash = hash & hash;
  }
  const basePrice = 20 + Math.abs(hash % 50);
  return { price: parseFloat(basePrice.toFixed(2)), trend: '2.3% upwards' };
};


// Generate common name from scientific name
const getCommonName = (scientificName: string, genus?: string): string => {
  const commonNames: Record<string, string> = {
    // FISH - TUNA & MACKEREL (SCOMBRIDAE)
    'Scombridae': 'Tuna/Mackerel Family',
    'Thunnus': 'Tuna',
    'Thunnus albacares': 'Yellowfin Tuna',
    'Thunnus obesus': 'Bigeye Tuna',
    'Thunnus thynnus': 'Bluefin Tuna',
    'Thunnus alalunga': 'Albacore Tuna',
    'Katsuwonus': 'Skipjack Tuna',
    'Katsuwonus pelamis': 'Skipjack Tuna',
    'Euthynnus': 'Little Tunny',
    'Euthynnus affinis': 'Kawakawa',
    'Gymnosarda unicolor': 'Dogtooth Tuna',
    'Auxis': 'Frigate Tuna',
    'Sarda': 'Bonito',

    // FISH - SURGEONFISH (ACANTHURIDAE)
    'Acanthuridae': 'Surgeonfish Family',
    'Acanthurus': 'Surgeonfish/Tang',
    'Acanthurus auranticavus': 'Ringtail Surgeonfish',
    'Acanthurus bariene': 'Black-spot Surgeonfish',
    'Acanthurus bleekeri': 'Bleeker\'s Surgeonfish',
    'Acanthurus dussumieri': 'Eyestripe Surgeonfish',
    'Acanthurus fowleri': 'Fowler\'s Surgeonfish',
    'Acanthurus gahhm': 'Black Surgeonfish',
    'Acanthurus guttatus': 'Spotted Surgeonfish',
    'Acanthurus leucocheilus': 'Pale-lipped Surgeonfish',
    'Acanthurus leucopareius': 'Whitebar Surgeonfish',
    'Acanthurus leucosternon': 'Powderblue Surgeonfish',
    'Acanthurus lineatus': 'Lined Surgeonfish',
    'Acanthurus mata': 'Elongate Surgeonfish',
    'Acanthurus nigricauda': 'Epaulette Surgeonfish',
    'Acanthurus nigrofuscus': 'Brown Surgeonfish',
    'Acanthurus olivaceus': 'Orangeband Surgeonfish',
    'Acanthurus pyroferus': 'Chocolate Surgeonfish',
    'Acanthurus triostegus': 'Convict Surgeonfish',
    'Acanthurus xanthopterus': 'Yellowfin Surgeonfish',

    // FISH - DAMSELFISH (POMACENTRIDAE)
    'Pomacentridae': 'Damselfish Family',
    'Abudefduf': 'Sergeant Major',
    'Abudefduf bengalensis': 'Bengal Sergeant',
    'Abudefduf saxatilis': 'Sergeant Major',
    'Abudefduf septemfasciatus': 'Banded Sergeant',
    'Abudefduf sexfasciatus': 'Scissortail Sergeant',
    'Abudefduf sordidus': 'Blackspot Sergeant',
    'Abudefduf vaigiensis': 'Indo-Pacific Sergeant',
    'Chromis': 'Chromis Damselfish',
    'Chromis viridis': 'Blue-Green Chromis',
    'Chromis atripectoralis': 'Black-axil Chromis',
    'Chromis margaritifer': 'Bicolor Chromis',
    'Chromis retrofasciata': 'Blackbar Chromis',
    'Chromis xanthura': 'Yellow-tail Chromis',
    'Dascyllus': 'Dascyllus Damselfish',
    'Dascyllus aruanus': 'Humbug Dascyllus',
    'Dascyllus carneus': 'Cloudy Dascyllus',
    'Dascyllus melanurus': 'Four-stripe Damselfish',
    'Dascyllus reticulatus': 'Reticulated Dascyllus',
    'Dascyllus trimaculatus': 'Domino Damselfish',
    'Amblyglyphidodon aureus': 'Golden Damselfish',
    'Amblyglyphidodon curacao': 'Staghorn Damselfish',
    'Amblyglyphidodon leucogaster': 'Yellow-belly Damselfish',

    // FISH - CLOWNFISH/ANEMONEFISH
    'Amphiprion': 'Clownfish',
    'Amphiprion akallopisos': 'Skunk Clownfish',
    'Amphiprion clarkii': 'Clark\'s Clownfish',
    'Amphiprion ephippium': 'Saddle Clownfish',
    'Amphiprion frenatus': 'Tomato Clownfish',
    'Amphiprion ocellaris': 'Common Clownfish',
    'Amphiprion perideraion': 'Pink Skunk Clownfish',
    'Amphiprion polymnus': 'Saddleback Clownfish',
    'Amphiprion sandaracinos': 'Orange Skunk Clownfish',

    // FISH - CARDINALFISH (APOGONIDAE)
    'Apogonidae': 'Cardinalfish Family',
    'Apogon': 'Cardinalfish',
    'Archamia': 'Cardinalfish',
    'Archamia fucata': 'Orangelined Cardinalfish',

    // FISH - TRIGGERFISH (BALISTIDAE)
    'Balistidae': 'Triggerfish Family',
    'Abalistes stellaris': 'Starry Triggerfish',
    'Balistapus': 'Triggerfish',
    'Balistapus undulatus': 'Orange-lined Triggerfish',
    'Balistes': 'Triggerfish',
    'Balistoides conspicillum': 'Clown Triggerfish',
    'Balistoides viridescens': 'Titan Triggerfish',

    // FISH - WRASSES (LABRIDAE)
    'Labridae': 'Wrasse Family',
    'Anampses': 'Tamarin Wrasse',
    'Anampses caeruleopunctatus': 'Blue-spotted Wrasse',
    'Anampses geographicus': 'Geographic Wrasse',
    'Cheilinus': 'Wrasse',
    'Cheilinus undulatus': 'Humphead Wrasse',
    'Halichoeres': 'Wrasse',

    // FISH - PUFFERFISH
    'Tetraodontidae': 'Pufferfish Family',
    'Arothron': 'Pufferfish',
    'Arothron hispidus': 'White-spotted Puffer',
    'Arothron mappa': 'Mappa Puffer',
    'Arothron nigropunctatus': 'Dog-faced Puffer',
    'Arothron stellatus': 'Starry Puffer',
    'Canthigaster': 'Sharpnose Puffer',
    'Canthigaster valentini': 'Valentine\'s Puffer',

    // FISH - GOBIES (GOBIIDAE)
    'Gobiidae': 'Goby Family',
    'Amblygobius': 'Sand Goby',
    'Amblyeleotris': 'Shrimp Goby',
    'Acentrogobius': 'Goby',

    // FISH - BLENNIES
    'Blenniidae': 'Blenny Family',
    'Salarias': 'Algae Blenny',
    'Salarias fasciatus': 'Lawnmower Blenny',
    'Ecsenius': 'Blenny',
    'Ecsenius bicolor': 'Bicolor Blenny',
    'Meiacanthus': 'Fang Blenny',

    // FISH - GROUPERS (SERRANIDAE)
    'Serranidae': 'Grouper Family',
    'Cephalopholis': 'Grouper',
    'Cephalopholis argus': 'Peacock Grouper',
    'Cephalopholis miniata': 'Coral Grouper',
    'Epinephelus': 'Grouper',
    'Plectropomus': 'Coral Trout',

    // FISH - BUTTERFLYFISH
    'Chaetodontidae': 'Butterflyfish Family',
    'Chaetodon': 'Butterflyfish',

    // FISH - ANGELFISH
    'Pomacanthidae': 'Angelfish Family',
    'Centropyge': 'Dwarf Angelfish',
    'Centropyge bicolor': 'Bicolor Angelfish',
    'Centropyge bispinosus': 'Coral Beauty',
    'Centropyge loriculus': 'Flame Angelfish',

    // FISH - FUSILIERS
    'Caesionidae': 'Fusilier Family',
    'Caesio': 'Fusilier',

    // FISH - JACKS/TREVALLIES
    'Carangidae': 'Jack Family',
    'Carangoides': 'Trevally',
    'Caranx': 'Jack',
    'Caranx ignobilis': 'Giant Trevally',

    // FISH - SNAPPERS
    'Lutjanidae': 'Snapper Family',

    // FISH - SHARKS & RAYS
    'Carcharhinidae': 'Requiem Shark',
    'Carcharhinus': 'Reef Shark',
    'Carcharhinus melanopterus': 'Blacktip Reef Shark',
    'Dasyatidae': 'Stingray',
    'Myliobatidae': 'Eagle Ray',
    'Aetobatus narinari': 'Spotted Eagle Ray',

    // CORALS - HARD CORALS
    'Scleractinia': 'Hard Coral',
    'Acroporidae': 'Staghorn Coral Family',
    'Acropora': 'Staghorn Coral',
    'Acanthastrea': 'Brain Coral',
    'Fungiidae': 'Mushroom Coral Family',
    'Fungia': 'Mushroom Coral',
    'Galaxea': 'Galaxy Coral',
    'Goniopora': 'Flowerpot Coral',
    'Montipora': 'Velvet Coral',
    'Pocillopora': 'Cauliflower Coral',
    'Porites': 'Finger Coral',

    // CORALS - SOFT CORALS
    'Alcyonacea': 'Soft Coral',
    'Alcyoniidae': 'Soft Coral',

    // ANEMONES & JELLYFISH
    'Actiniaria': 'Sea Anemone',
    'Scyphozoa': 'Jellyfish',
    'Hydrozoa': 'Hydromedusa',

    // ECHINODERMS
    'Asteroidea': 'Starfish',
    'Acanthaster planci': 'Crown-of-Thorns Starfish',
    'Ophiuroidea': 'Brittle Star',
    'Echinoidea': 'Sea Urchin',
    'Holothuroidea': 'Sea Cucumber',
    'Holothuria': 'Sea Cucumber',
    'Holothuria atra': 'Black Sea Cucumber',
    'Actinopyga': 'Sea Cucumber',
    'Stichopus': 'Sea Cucumber',
    'Crinoidea': 'Feather Star',

    // MOLLUSKS
    'Cephalopoda': 'Cephalopod',
    'Octopoda': 'Octopus',
    'Teuthida': 'Squid',
    'Sepiida': 'Cuttlefish',
    'Bivalvia': 'Clam',
    'Tridacna': 'Giant Clam',
    'Gastropoda': 'Snail',

    // CRUSTACEANS
    'Decapoda': 'Decapod',
    'Caridea': 'Shrimp',
    'Alpheus': 'Pistol Shrimp',
    'Lysmata': 'Cleaner Shrimp',
    'Paguroidea': 'Hermit Crab',
    'Brachyura': 'Crab',
    'Stomatopoda': 'Mantis Shrimp',
    'Cirripedia': 'Barnacle',
    'Balanus': 'Barnacle',
    'Copepoda': 'Copepod',
    'Calanoida': 'Calanoid Copepod',
    'Acartia': 'Acartia Copepod',
    'Calanus': 'Calanus Copepod',
    'Eucalanus': 'Eucalanus Copepod',
    'Amphipoda': 'Amphipod',

    // WORMS
    'Polychaeta': 'Polychaete Worm',
    'Sabellidae': 'Feather Duster Worm',
    'Platyhelminthes': 'Flatworm',

    // TUNICATES & SPONGES
    'Ascidiacea': 'Sea Squirt',
    'Porifera': 'Sponge',

    // MARINE ALGAE
    'Chlorophyta': 'Green Algae',
    'Caulerpa': 'Caulerpa',
    'Caulerpa racemosa': 'Sea Grapes',
    'Halimeda': 'Halimeda',
    'Ulva': 'Sea Lettuce',
    'Rhodophyta': 'Red Algae',
    'Phaeophyceae': 'Brown Algae',
    'Sargassum': 'Sargassum',
  };

  // Try exact match
  if (commonNames[scientificName]) {
    return commonNames[scientificName];
  }

  // Try genus match
  if (genus && commonNames[genus]) {
    return commonNames[genus];
  }

  // Try partial match
  for (const key in commonNames) {
    if (scientificName.includes(key)) {
      return commonNames[key];
    }
  }

  // Generate from scientific name
  const parts = scientificName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }

  return scientificName;
};

// Get badge color for category
const getCategoryColor = (category: string): string => {
  if (category.includes('Fish')) return 'bg-blue-500/30 border-blue-400/50';
  if (category === 'Copepod' || category === 'Crustacean' || category === 'Barnacle') return 'bg-orange-500/30 border-orange-400/50';
  if (category === 'Coral' || category === 'Hydrozoan' || category === 'Jellyfish') return 'bg-pink-500/30 border-pink-400/50';
  if (category.includes('Snail') || category.includes('Clam') || category.includes('Octopus') || category.includes('Squid')) return 'bg-purple-500/30 border-purple-400/50';
  if (category.includes('Sea') || category.includes('Starfish') || category.includes('Urchin') || category.includes('Brittle')) return 'bg-yellow-500/30 border-yellow-400/50';
  if (category.includes('Algae') || category.includes('Diatom') || category.includes('Plant')) return 'bg-green-500/30 border-green-400/50';
  if (category.includes('Sponge') || category.includes('Squirt')) return 'bg-cyan-500/30 border-cyan-400/50';
  if (category.includes('Worm')) return 'bg-red-500/30 border-red-400/50';
  return 'bg-gray-500/30 border-gray-400/50';
};

// Get general category from class/phylum
const getCategory = (className?: string, phylum?: string): string => {
  if (!className) return 'Unknown';

  const categoryMap: Record<string, string> = {
    // Fish
    'Actinopteri': 'Fish',
    'Actinopterygii': 'Fish',
    'Chondrichthyes': 'Fish (Cartilaginous)',
    'Myxini': 'Fish (Hagfish)',
    'Petromyzonti': 'Fish (Lamprey)',

    // Crustaceans
    'Maxillopoda': 'Copepod',
    'Malacostraca': 'Crustacean',
    'Branchiopoda': 'Crustacean',
    'Ostracoda': 'Crustacean',
    'Cirripedia': 'Barnacle',

    // Corals & Anemones
    'Anthozoa': 'Coral',
    'Hydrozoa': 'Hydrozoan',
    'Scyphozoa': 'Jellyfish',

    // Mollusks
    'Gastropoda': 'Snail/Slug',
    'Bivalvia': 'Clam/Mussel',
    'Cephalopoda': 'Octopus/Squid',
    'Polyplacophora': 'Chiton',
    'Scaphopoda': 'Tusk Shell',

    // Echinoderms
    'Holothuroidea': 'Sea Cucumber',
    'Asteroidea': 'Starfish',
    'Ophiuroidea': 'Brittle Star',
    'Echinoidea': 'Sea Urchin',
    'Crinoidea': 'Feather Star',

    // Worms
    'Polychaeta': 'Marine Worm',
    'Clitellata': 'Worm',
    'Turbellaria': 'Flatworm',

    // Algae
    'Ulvophyceae': 'Green Algae',
    'Florideophyceae': 'Red Algae',
    'Phaeophyceae': 'Brown Algae',
    'Bacillariophyceae': 'Diatom',
    'Dinophyceae': 'Dinoflagellate',
    'Cyanophyceae': 'Blue-green Algae',

    // Plants
    'Equisetopsida': 'Marine Plant',
    'Magnoliopsida': 'Flowering Plant',

    // Sponges & Others
    'Demospongiae': 'Sponge',
    'Calcarea': 'Sponge',
    'Hexactinellida': 'Glass Sponge',
    'Ascidiacea': 'Sea Squirt',
    'Appendicularia': 'Larvacean',
    'Thaliacea': 'Salp',

    // Protists
    'Acantharia': 'Acantharian',
    'Phaeodaria': 'Phaeodarian',
    'Foraminifera': 'Foraminiferan',
  };

  return categoryMap[className] || className;
};

export default function FishSidebar({ fish, onClose }: FishSidebarProps) {
  const [priceData, setPriceData] = useState<FishPriceData[]>([]);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const response = await fetch('/average_edible_fish_prices_Jul2024_Jul2025.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');

        const data: FishPriceData[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          const values = line.split(',');
          const rowData = {} as FishPriceData;
          headers.forEach((header, index) => {
            rowData[header.trim()] = values[index]?.trim() || '';
          });
          data.push(rowData);
        }

        setPriceData(data);
        console.log('Loaded fish prices:', data);
      } catch (error) {
        console.error('Failed to load fish prices:', error);
      }
    };

    loadPrices();
  }, []);

  if (!fish) return null;

  const priceHistory = generatePriceHistory(fish.scientificName, priceData);
  const { price: lastPrice, trend: priceTrend } = getLastPrice(fish.scientificName, priceData);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white/10 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ${
        fish ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-semibold border rounded-md text-white ${getCategoryColor(getCategory(fish.class, fish.phylum))}`}>
                {getCategory(fish.class, fish.phylum)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{fish.scientificName}</h2>
            <p className="text-base text-white/80 mb-1">{getCommonName(fish.scientificName, fish.genus)}</p>
            <p className="text-sm text-white/60">{fish.genus || 'Unknown Genus'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Last Price Sold Box */}
        <div className="bg-white/5 border border-white/20 rounded-xl p-6 mb-6">
          <div className="text-sm text-white/60 mb-2">Predicted Selling Price</div>
          <div className="text-4xl font-bold text-white mb-1">~${lastPrice}/lb</div>
          <div className="text-xs text-green-400">{priceTrend}</div>
        </div>

        {/* Fish Details */}
        <div className="bg-white/5 border border-white/20 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Family:</span>
              <span className="text-white font-medium">{fish.family || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Location:</span>
              <span className="text-white font-medium">{fish.waterBody || fish.locality || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Country:</span>
              <span className="text-white font-medium">{fish.country || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Coordinates:</span>
              <span className="text-white font-medium text-xs">
                {fish.decimalLatitude.toFixed(4)}, {fish.decimalLongitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Past Sell Prices Graph */}
        <div className="bg-white/5 border border-white/20 rounded-xl p-4 flex-1">
          <h3 className="text-sm font-semibold text-white mb-4">Past Sell Prices (Jul 2024 - Jun 2025)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.5)"
                fontSize={11}
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                fontSize={11}
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#5ECDBF"
                strokeWidth={2}
                dot={{ fill: '#5ECDBF', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

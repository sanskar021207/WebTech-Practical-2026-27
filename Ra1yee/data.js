/* GearForge sample data.
   Replace LISTINGS with a real API call later; the rest of the site only reads these arrays. */

const CATEGORIES = [
  { id: 'cpu',     name: 'Processors' },
  { id: 'gpu',     name: 'Graphics cards' },
  { id: 'mobo',    name: 'Motherboards' },
  { id: 'ram',     name: 'Memory' },
  { id: 'storage', name: 'Storage' },
  { id: 'psu',     name: 'Power supplies' },
  { id: 'case',    name: 'Cases' },
  { id: 'cooler',  name: 'Cooling' }
];

const PLATFORMS = {
  AM5:     { label: 'AM5',     memory: 'DDR5 only' },
  LGA1700: { label: 'LGA1700', memory: 'DDR4 or DDR5, depending on the board' },
  AM4:     { label: 'AM4',     memory: 'DDR4 only' }
};

/* condition: 'new' | 'open' | 'used'
   compat:    ['any'] or a list of platform keys
   added:     days since it was listed
   brand:     manufacturer shown in "Shop by brand" and on each card */
const LISTINGS = [
  { id: 1,  title: 'AMD Ryzen 7 7700X',                 category: 'cpu',     condition: 'used', price: 209, specs: '8 cores, 16 threads, up to 5.4 GHz boost',            seller: 'bench_aria',      rating: 4.9, sales: 212, compat: ['AM5'],                     added: 1,  brand: 'AMD' },
  { id: 2,  title: 'AMD Ryzen 5 7600',                  category: 'cpu',     condition: 'new',  price: 189, specs: '6 cores, 12 threads, cooler included',                 seller: 'northgate_parts', rating: 4.8, sales: 540, compat: ['AM5'],                     added: 3,  brand: 'AMD' },
  { id: 3,  title: 'Intel Core i5-13600K',              category: 'cpu',     condition: 'open', price: 219, specs: '14 cores (6P + 8E), unlocked, no cooler',              seller: 'mint_silicon',    rating: 4.7, sales: 96,  compat: ['LGA1700'],                 added: 2,  brand: 'Intel' },
  { id: 4,  title: 'AMD Ryzen 5 5600',                  category: 'cpu',     condition: 'used', price: 79,  specs: '6 cores, 12 threads, boxed cooler included',           seller: 'rig_recycler',    rating: 4.6, sales: 138, compat: ['AM4'],                     added: 6,  brand: 'AMD' },
  { id: 5,  title: 'GeForce RTX 4070 Super 12 GB',      category: 'gpu',     condition: 'used', price: 489, specs: '12 GB GDDR6X, dual fan, 2 years old',                  seller: 'kavi_pc',         rating: 4.9, sales: 71,  compat: ['any'],                     added: 0,  brand: 'MSI' },
  { id: 6,  title: 'Radeon RX 7800 XT 16 GB',           category: 'gpu',     condition: 'open', price: 429, specs: '16 GB GDDR6, triple fan, original box',                seller: 'northgate_parts', rating: 4.8, sales: 540, compat: ['any'],                     added: 4,  brand: 'ASUS' },
  { id: 7,  title: 'GeForce RTX 3060 12 GB',            category: 'gpu',     condition: 'used', price: 179, specs: '12 GB GDDR6, dual fan, never mined on',                seller: 'lowprofile_lee',  rating: 4.5, sales: 33,  compat: ['any'],                     added: 8,  brand: 'Gigabyte' },
  { id: 8,  title: 'ASUS TUF Gaming B650-Plus WiFi',    category: 'mobo',    condition: 'used', price: 149, specs: 'ATX, DDR5, PCIe 4.0, Wi-Fi 6',                         seller: 'bench_aria',      rating: 4.9, sales: 212, compat: ['AM5'],                     added: 5,  brand: 'ASUS' },
  { id: 9,  title: 'Gigabyte B760 Aorus Elite',         category: 'mobo',    condition: 'open', price: 139, specs: 'ATX, DDR5, PCIe 4.0, 2.5 GbE',                         seller: 'mint_silicon',    rating: 4.7, sales: 96,  compat: ['LGA1700'],                 added: 7,  brand: 'Gigabyte' },
  { id: 10, title: 'MSI B550 Gaming Plus',              category: 'mobo',    condition: 'used', price: 69,  specs: 'ATX, DDR4, PCIe 4.0, includes I/O shield',             seller: 'rig_recycler',    rating: 4.6, sales: 138, compat: ['AM4'],                     added: 9,  brand: 'MSI' },
  { id: 11, title: 'Corsair Vengeance 32 GB DDR5-6000', category: 'ram',     condition: 'new',  price: 104, specs: '2 x 16 GB kit, CL30, black heat spreaders',            seller: 'northgate_parts', rating: 4.8, sales: 540, compat: ['AM5', 'LGA1700'],          added: 2,  brand: 'Corsair' },
  { id: 12, title: 'G.Skill Ripjaws 16 GB DDR4-3600',   category: 'ram',     condition: 'used', price: 34,  specs: '2 x 8 GB kit, CL16',                                   seller: 'tinkerdeck',      rating: 4.4, sales: 19,  compat: ['AM4', 'LGA1700'],          added: 12, brand: 'G.Skill' },
  { id: 13, title: 'Samsung 980 Pro 1 TB NVMe',         category: 'storage', condition: 'used', price: 59,  specs: 'PCIe 4.0 M.2, drive health 96%',                       seller: 'kavi_pc',         rating: 4.9, sales: 71,  compat: ['any'],                     added: 3,  brand: 'Samsung' },
  { id: 14, title: 'WD Blue 4 TB hard drive',           category: 'storage', condition: 'new',  price: 79,  specs: '3.5 inch, 5400 RPM, SATA',                             seller: 'northgate_parts', rating: 4.8, sales: 540, compat: ['any'],                     added: 10, brand: 'Western Digital' },
  { id: 15, title: 'Corsair RM850x 850 W',              category: 'psu',     condition: 'used', price: 89,  specs: 'Fully modular, 80+ Gold, all cables included',         seller: 'lowprofile_lee',  rating: 4.5, sales: 33,  compat: ['any'],                     added: 4,  brand: 'Corsair' },
  { id: 16, title: 'Fractal Design North',              category: 'case',    condition: 'open', price: 119, specs: 'ATX mid tower, mesh front, 2 fans included',           seller: 'tinkerdeck',      rating: 4.4, sales: 19,  compat: ['any'],                     added: 6,  brand: 'Fractal Design' },
  { id: 17, title: 'Noctua NH-D15',                     category: 'cooler',  condition: 'used', price: 74,  specs: 'Dual tower, 2 x 140 mm fans, AM4, AM5 and LGA1700 kits', seller: 'bench_aria',    rating: 4.9, sales: 212, compat: ['AM5', 'AM4', 'LGA1700'],   added: 11, brand: 'Noctua' },
  { id: 18, title: 'Thermalright Peerless Assassin 120', category: 'cooler', condition: 'new',  price: 39,  specs: 'Dual tower, 2 x 120 mm fans, all mounting kits',       seller: 'mint_silicon',    rating: 4.7, sales: 96,  compat: ['AM5', 'AM4', 'LGA1700'],   added: 1,  brand: 'Thermalright' }
];

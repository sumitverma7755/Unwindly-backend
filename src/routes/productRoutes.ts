import { Router, Request, Response } from 'express';

const router = Router();

export interface ProductData {
  sku: string;
  name: string;
  category: string;
  series: string;
  brand: string;
  model?: string;
  powerRating: string;
  voltageRating: string;
  phase: string;
  inStock: boolean;
  price: string;
  description: string;
  image: string;
  breadcrumbs: string[];
  downloads: {
    datasheets: { name: string; size: string; url: string }[];
    manuals: { name: string; size: string; url: string }[];
    cadDrawings: { name: string; size: string; url: string }[];
    software: { name: string; size: string; url: string }[];
  };
  compatibleProducts: {
    sku: string;
    name: string;
    type: string;
    image: string;
  }[];
  frequentlyBoughtTogether?: {
    bundlePrice: number;
    accessories: {
      sku: string;
      name: string;
      price: number;
      specs: string;
      image: string;
    }[];
  };
}

const PRODUCTS_DATABASE: Record<string, ProductData> = {
  'ATV320U15N4C': {
    sku: 'ATV320U15N4C',
    name: 'Variable Speed Drive Altivar Machine ATV320',
    category: 'VFD Drives',
    series: 'ATV320',
    brand: 'Schneider Electric',
    powerRating: '0.37kW - 15kW',
    voltageRating: '380 - 480V',
    phase: '3~',
    inStock: true,
    price: '$450.00',
    description: 'Compact variable speed drive for commercial and industrial 3-phase asynchronous and synchronous motors.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600',
    breadcrumbs: ['Home', 'VFD Drives', 'ATV320', 'ATV320U15N4C'],
    downloads: {
      datasheets: [
        { name: 'ATV320 Technical Datasheet PDF', size: '2.4 MB', url: '#' },
        { name: 'ATV320 Product Specification Guide', size: '1.8 MB', url: '#' }
      ],
      manuals: [
        { name: 'Altivar 320 User Manual (English)', size: '8.5 MB', url: '#' },
        { name: 'Altivar 320 Installation & Safety Guide', size: '4.1 MB', url: '#' }
      ],
      cadDrawings: [
        { name: 'ATV320U15N4C 2D/3D CAD STEP File', size: '5.2 MB', url: '#' },
        { name: 'ATV320 Mounting Dimensions DXF', size: '1.2 MB', url: '#' }
      ],
      software: [
        { name: 'SoMove Setup Software v2.9', size: '124 MB', url: '#' },
        { name: 'ATV320 DTM Library Update', size: '18 MB', url: '#' }
      ]
    },
    compatibleProducts: [
      {
        sku: 'VW3A3201',
        name: 'Line Reactor',
        type: 'Choke / Filter',
        image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?q=80&w=300'
      },
      {
        sku: 'VW3A1104',
        name: 'EMC Filter',
        type: 'Noise Filter',
        image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=300'
      },
      {
        sku: 'VW3M7101',
        name: 'Remote Keypad',
        type: 'HMI Display',
        image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=300'
      },
      {
        sku: 'VW3A3607',
        name: 'Brake Resistor',
        type: 'Resistor Unit',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=300'
      }
    ]
  },
  'VW3A3201': {
    sku: 'VW3A3201',
    name: 'Line Reactor for Altivar Drives',
    category: 'Accessories',
    series: 'VW3A',
    brand: 'Schneider Electric',
    powerRating: '0.37kW - 15kW compatible',
    voltageRating: '380 - 480V',
    phase: '3~',
    inStock: true,
    price: '$120.00',
    description: 'Line reactor for reduction of harmonic currents and protection of VFD drives against voltage spikes.',
    image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?q=80&w=300',
    breadcrumbs: ['Home', 'Accessories', 'VW3A', 'VW3A3201'],
    downloads: {
      datasheets: [
        { name: 'VW3A3201 Product Datasheet PDF', size: '1.2 MB', url: '#' }
      ],
      manuals: [
        { name: 'VW3A3201 Instruction Sheet', size: '0.9 MB', url: '#' }
      ],
      cadDrawings: [
        { name: 'VW3A3201 CAD Model STEP', size: '2.1 MB', url: '#' }
      ],
      software: []
    },
    compatibleProducts: [
      {
        sku: 'ATV320U15N4C',
        name: 'Altivar Machine ATV320',
        type: 'VFD Drive',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600'
      }
    ]
  },
  'VW3A1104': {
    sku: 'VW3A1104',
    name: 'EMC Input Filter',
    category: 'Accessories',
    series: 'VW3A',
    brand: 'Schneider Electric',
    powerRating: 'N/A',
    voltageRating: '380 - 480V',
    phase: '3~',
    inStock: true,
    price: '$95.00',
    description: 'EMC input filter for variable speed drives to reduce conducted radio-frequency interference on the mains network.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=300',
    breadcrumbs: ['Home', 'Accessories', 'VW3A', 'VW3A1104'],
    downloads: {
      datasheets: [
        { name: 'VW3A1104 Technical Specifications', size: '1.5 MB', url: '#' }
      ],
      manuals: [
        { name: 'VW3A1104 Installation Manual', size: '1.1 MB', url: '#' }
      ],
      cadDrawings: [],
      software: []
    },
    compatibleProducts: [
      {
        sku: 'ATV320U15N4C',
        name: 'Altivar Machine ATV320',
        type: 'VFD Drive',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600'
      }
    ]
  },
  'VW3M7101': {
    sku: 'VW3M7101',
    name: 'Remote Keypad Display HMI',
    category: 'Accessories',
    series: 'VW3M',
    brand: 'Schneider Electric',
    powerRating: 'N/A',
    voltageRating: 'N/A',
    phase: 'N/A',
    inStock: true,
    price: '$80.00',
    description: 'Remote graphic display terminal for variable speed drives, providing an intuitive configuration and diagnostic interface.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=300',
    breadcrumbs: ['Home', 'Accessories', 'VW3M', 'VW3M7101'],
    downloads: {
      datasheets: [
        { name: 'VW3M7101 Catalog Sheet', size: '0.8 MB', url: '#' }
      ],
      manuals: [
        { name: 'VW3M7101 HMI Programming Manual', size: '3.4 MB', url: '#' }
      ],
      cadDrawings: [],
      software: []
    },
    compatibleProducts: [
      {
        sku: 'ATV320U15N4C',
        name: 'Altivar Machine ATV320',
        type: 'VFD Drive',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600'
      }
    ]
  },
  'VW3A3607': {
    sku: 'VW3A3607',
    name: 'Braking Resistor Unit',
    category: 'Accessories',
    series: 'VW3A',
    brand: 'Schneider Electric',
    powerRating: 'N/A',
    voltageRating: 'N/A',
    phase: 'N/A',
    inStock: false,
    price: '$150.00',
    description: 'Braking resistor for dissipation of regenerative energy generated during deceleration or high inertia stops of motor.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=300',
    breadcrumbs: ['Home', 'Accessories', 'VW3A', 'VW3A3607'],
    downloads: {
      datasheets: [
        { name: 'VW3A3607 Technical Datasheet', size: '1.0 MB', url: '#' }
      ],
      manuals: [
        { name: 'VW3A3607 Safety Guidelines', size: '0.5 MB', url: '#' }
      ],
      cadDrawings: [],
      software: []
    },
    compatibleProducts: [
      {
        sku: 'ATV320U15N4C',
        name: 'Altivar Machine ATV320',
        type: 'VFD Drive',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600'
      }
    ]
  },
  '6SL3710-7LG38-1AA3': {
    sku: '6SL3710-7LG38-1AA3',
    name: 'Siemens, SINAMICS S150, 6SL3710-7LG38-1AA3, 800kW / 1072HP, Three-Phase, 500-690V',
    category: 'VFD Drives',
    series: 'SINAMICS S150',
    brand: 'Siemens',
    model: 'sinamics-s150',
    powerRating: '800kW / 1072HP',
    voltageRating: '500 - 690V',
    phase: '3~',
    inStock: true,
    price: 'Quote Requested',
    description: 'Siemens, SINAMICS S150, 6SL3710-7LG38-1AA3, 800kW / 1072HP, Three-Phase, 500-690V VFD Drive for high-performance applications.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600',
    breadcrumbs: ['Home', 'Shop', 'VFD Drives', 'Siemens', 'SINAMICS S150', '6SL3710-7LG38-1AA3'],
    downloads: {
      datasheets: [
        { name: 'SINAMICS S150 Technical Datasheet', size: '4.2 MB', url: '#' }
      ],
      manuals: [
        { name: 'SINAMICS S150 Operating Instructions', size: '12.5 MB', url: '#' },
        { name: 'SINAMICS S150 List Manual', size: '9.1 MB', url: '#' }
      ],
      cadDrawings: [
        { name: 'SINAMICS S150 STEP File', size: '8.4 MB', url: '#' }
      ],
      software: []
    },
    compatibleProducts: [
      {
        sku: '6SL3000-0CE25-0AA0',
        name: 'Line Reactor',
        type: 'Choke / Filter',
        image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?q=80&w=300'
      },
      {
        sku: '6SL3000-0BE25-0AA0',
        name: 'EMC Filter',
        type: 'Noise Filter',
        image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=300'
      },
      {
        sku: '6SL3000-0AE25-0AA0',
        name: 'Braking Resistor',
        type: 'Resistor Unit',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=300'
      }
    ],
    frequentlyBoughtTogether: {
      bundlePrice: 110650,
      accessories: [
        {
          sku: '6SL3000-0CE25-0AA0',
          name: 'Line Reactor',
          price: 45600,
          specs: '800kW/1072HP | 500 - 690V | 3 Phase',
          image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?q=80&w=300'
        },
        {
          sku: '6SL3000-0BE25-0AA0',
          name: 'EMC Filter',
          price: 38250,
          specs: '800kW/1072HP | 500 - 690V | 3 Phase',
          image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=300'
        },
        {
          sku: '6SL3000-0AE25-0AA0',
          name: 'Braking Resistor',
          price: 26800,
          specs: '800kW/1072HP | 500 - 690V | 3 Phase',
          image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=300'
        }
      ]
    }
  },
  '6SL3000-0CE25-0AA0': {
    sku: '6SL3000-0CE25-0AA0',
    name: 'Line Reactor for SINAMICS S150',
    category: 'Accessories',
    series: 'SINAMICS',
    brand: 'Siemens',
    powerRating: '800kW compatible',
    voltageRating: '500 - 690V',
    phase: '3~',
    inStock: true,
    price: '₹ 45,600.00',
    description: 'Line reactor for SINAMICS S150, mitigates harmonics on line side.',
    image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?q=80&w=300',
    breadcrumbs: ['Home', 'Accessories', 'Siemens', '6SL3000-0CE25-0AA0'],
    downloads: { datasheets: [], manuals: [], cadDrawings: [], software: [] },
    compatibleProducts: []
  },
  '6SL3000-0BE25-0AA0': {
    sku: '6SL3000-0BE25-0AA0',
    name: 'EMC Filter for SINAMICS S150',
    category: 'Accessories',
    series: 'SINAMICS',
    brand: 'Siemens',
    powerRating: '800kW compatible',
    voltageRating: '500 - 690V',
    phase: '3~',
    inStock: true,
    price: '₹ 38,250.00',
    description: 'EMC filter for radio interference suppression according to EN 61800-3.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=300',
    breadcrumbs: ['Home', 'Accessories', 'Siemens', '6SL3000-0BE25-0AA0'],
    downloads: { datasheets: [], manuals: [], cadDrawings: [], software: [] },
    compatibleProducts: []
  },
  '6SL3000-0AE25-0AA0': {
    sku: '6SL3000-0AE25-0AA0',
    name: 'Braking Resistor for SINAMICS S150',
    category: 'Accessories',
    series: 'SINAMICS',
    brand: 'Siemens',
    powerRating: '800kW compatible',
    voltageRating: '500 - 690V',
    phase: '3~',
    inStock: true,
    price: '₹ 26,800.00',
    description: 'Braking resistor for dissipation of regenerative energy.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=300',
    breadcrumbs: ['Home', 'Accessories', 'Siemens', '6SL3000-0AE25-0AA0'],
    downloads: { datasheets: [], manuals: [], cadDrawings: [], software: [] },
    compatibleProducts: []
  }
};

// GET /api/products/scan/:code - Process scanner code / QR query
router.get('/scan/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const product = PRODUCTS_DATABASE[code];

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with SKU or code "${code}" was not found in the database.`,
      scannedCode: code
    });
  }

  return res.status(200).json({
    success: true,
    scannedCode: code,
    product
  });
});

// GET /api/products/:sku - Get specific product details by SKU
router.get('/:sku', (req: Request, res: Response) => {
  const sku = (req.params.sku || '').trim().toUpperCase();
  const product = PRODUCTS_DATABASE[sku];

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with SKU "${sku}" was not found in the database.`
    });
  }

  return res.status(200).json({
    success: true,
    product
  });
});

export default router;

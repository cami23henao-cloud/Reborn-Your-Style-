import { Garment, GarmentColor, Professional, Tutorial, User } from '../types';

export const INITIAL_USER: User = {
  id: 'user-carmen-01',
  name: 'Carmen Velásquez',
  email: 'carmen.velasquez@rebornstyle.org',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Amante del diseño regenerativo y apasionada por rescatar piezas textiles de sastrería y denim clásico.',
  country: 'Colombia',
  department: 'Antioquia',
  city: 'Medellín',
  neighborhood: 'Buenos Aires',
  address: 'Calle 49 #35-12',
  phone: '+57 300 123 4567',
  preferences: ['Sastrería circular', 'Bordado visible', 'Upcycling denim'],
  isVerified: true,
  joinedDate: 'Marzo 2026',
  authProvider: 'email',
};

export const GARMENT_COLORS: GarmentColor[] = [
  { id: 'blanco', name: 'Blanco', hex: '#FFFFFF', border: true },
  { id: 'crema', name: 'Crema', hex: '#FDFBF7', border: true },
  { id: 'beige', name: 'Beige', hex: '#E8DCB8' },
  { id: 'amarillo', name: 'Amarillo', hex: '#FACC15' },
  { id: 'naranja', name: 'Naranja', hex: '#FB923C' },
  { id: 'rojo', name: 'Rojo', hex: '#EF4444' },
  { id: 'rosado', name: 'Rosado', hex: '#F472B6' },
  { id: 'morado', name: 'Morado', hex: '#A855F7' },
  { id: 'azul', name: 'Azul', hex: '#3B82F6' },
  { id: 'verde', name: 'Verde', hex: '#22C55E' },
  { id: 'cafe', name: 'Café', hex: '#78350F' },
  { id: 'gris', name: 'Gris', hex: '#9CA3AF' },
  { id: 'negro', name: 'Negro', hex: '#111827' },
  { id: 'multicolor', name: 'Multicolor', hex: 'linear-gradient(135deg, #f87171, #facc15, #4ade80, #60a5fa, #c084fc)' },
  { id: 'otro', name: 'Otro', hex: '#D6D3D1' },
];

export interface CountryLocation {
  name: string;
  departments: {
    name: string;
    cities: {
      name: string;
      neighborhoods: string[];
    }[];
  }[];
}

export const LOCATION_HIERARCHY: CountryLocation[] = [
  {
    name: 'Colombia',
    departments: [
      {
        name: 'Antioquia',
        cities: [
          {
            name: 'Medellín',
            neighborhoods: ['El Poblado', 'Laureles', 'Buenos Aires', 'Belén', 'Envigado (Área Met.)', 'Robledo', 'Castilla', 'La Candelaria (Centro)', 'Aranjuez', 'Manrique', 'Guayabal', 'Sabaneta'],
          },
          {
            name: 'Bello',
            neighborhoods: ['Cabañas', 'Niquía', 'Santa Ana', 'Prado', 'Pérez'],
          },
          {
            name: 'Rionegro',
            neighborhoods: ['El Porvenir', 'San Antonio de Pereira', 'Llanogrande', 'Centro'],
          },
        ],
      },
      {
        name: 'Bogotá D.C. / Cundinamarca',
        cities: [
          {
            name: 'Bogotá',
            neighborhoods: ['Chapinero', 'Usaquén', 'Teusaquillo', 'La Candelaria', 'Suba', 'Kennedy', 'Santa Fe', 'Engativá', 'Fontibón', 'Barrios Unidos'],
          },
          {
            name: 'Chía',
            neighborhoods: ['Centro', 'La Balsa', 'Fonquetá', 'Yerbabuena'],
          },
        ],
      },
      {
        name: 'Valle del Cauca',
        cities: [
          {
            name: 'Cali',
            neighborhoods: ['San Antonio', 'Granada', 'El Peñón', 'Ciudad Jardín', 'Tequendama', 'Versalles', 'La Flora'],
          },
          {
            name: 'Palmira',
            neighborhoods: ['Centro', 'Zamora', 'Las Mercedes'],
          },
        ],
      },
      {
        name: 'Santander',
        cities: [
          {
            name: 'Bucaramanga',
            neighborhoods: ['Cabecera del Llano', 'Sotomayor', 'San Francisco', 'Centro', 'Provenza'],
          },
        ],
      },
      {
        name: 'Atlántico',
        cities: [
          {
            name: 'Barranquilla',
            neighborhoods: ['El Prado', 'Alto Prado', 'Villa Country', 'Riomar', 'Boston'],
          },
        ],
      },
    ],
  },
  {
    name: 'España',
    departments: [
      {
        name: 'Madrid',
        cities: [
          {
            name: 'Madrid',
            neighborhoods: ['Centro', 'Malasaña', 'Chamberí', 'Salamanca', 'Lavapiés', 'Retiro', 'Chueca', 'Arganzuela'],
          },
        ],
      },
      {
        name: 'Cataluña',
        cities: [
          {
            name: 'Barcelona',
            neighborhoods: ['Gràcia', 'Born', 'Eixample', 'Poblenou', 'Gòtic', 'Sant Antoni'],
          },
        ],
      },
      {
        name: 'Comunidad Valenciana',
        cities: [
          {
            name: 'Valencia',
            neighborhoods: ['Ruzafa', 'El Carmen', 'Benimaclet', 'Cabañal', 'Ensanche'],
          },
        ],
      },
      {
        name: 'Andalucía',
        cities: [
          {
            name: 'Sevilla',
            neighborhoods: ['Triana', 'Santa Cruz', 'Alameda', 'Los Remedios', 'Nervión'],
          },
        ],
      },
    ],
  },
];

export const INITIAL_GARMENTS: Garment[] = [
  {
    id: 'garment-1',
    title: 'Trench clásico para recortar o estructurar',
    category: 'chaquetas',
    condition: 'Muy bueno',
    size: 'Talla M',
    composition: '100% Algodón',
    description: 'Tejido de gabardina pesado. Busco modista para convertirlo en chaqueta cropped y chaleco desmontable.',
    country: 'España',
    department: 'Madrid',
    city: 'Madrid',
    neighborhood: 'Centro',
    address: 'Calle Mayor, 24',
    colorName: 'Beige',
    colorHex: '#E8DCB8',
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBDz-Y9idJ7dQU4FpRn-J-KxmGfgtsqgcjZ8m6N67UArUy32Spefetvs8MJUJ4ddq_VkaThFcTyPMbCvrkdMSUWK9FwJcN8fgs7CL5ES5rb-RkpE8e_bOaqtUCpHW1QHTIsiYdFeXocOjSXcN0T5mzg14UFLONEtJd7Wv5b4HCGcIVkc2JMcgO2X0aEPXY5ruQEN9bYqj-hkhUynxW3dLa4-45U0kBMwle61tY3a_T2ZimhjdUkTZa1yA',
    ],
    createdAt: 'Publicado hace 2 días',
    authorName: 'Clara Domínguez',
    status: 'disponible',
  },
  {
    id: 'garment-2',
    title: 'Dos tejanos vintage para tote bag o corset',
    category: 'pantalones',
    condition: 'Con desgaste',
    size: 'Talla 38',
    composition: 'Denim puro',
    description: 'Denim japonés rígido sin elástico. Ideal para patronaje de bolso estructural o patchwork.',
    country: 'España',
    department: 'Cataluña',
    city: 'Barcelona',
    neighborhood: 'Gràcia',
    address: 'Carrer de Verdi, 12',
    colorName: 'Azul',
    colorHex: '#3B82F6',
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkSeK_i0pwtUiVpUcl4PgyS96cEY0E_56PSML32Bchs7uid0DoOB4OLY8RUz7MFwvpEfjVUOpaesneUuFUqCT65ssJ7CnwurbVynE_43vwFkeRsAi3DZEfR7-1hm0fI3EcqUzxBVjxL8wx4l0uEI0rb4rPdAspDfkRQE1VAD87DEf1II7mvH-Pa7X5-AYmg08UZVrkIvDIaliVAWOvFo-adDABVxxe5mne8MoZPIksLu5vsbLQQiMMJQ',
    ],
    createdAt: 'Publicado ayer',
    authorName: 'Marc Valls',
    status: 'disponible',
  },
  {
    id: 'garment-3',
    title: 'Vestido largo de lino crudo para conjunto 2 piezas',
    category: 'vestidos',
    condition: 'Excelente (Sin uso)',
    size: 'Talla L',
    composition: '100% Lino',
    description: 'Lino pesado y noble. Quiero dividirlo en blusa kimono y falda recta midi con cintura ajustable.',
    country: 'España',
    department: 'Comunidad Valenciana',
    city: 'Valencia',
    neighborhood: 'Ruzafa',
    address: 'Carrer de Cuba, 18',
    colorName: 'Crema',
    colorHex: '#FDFBF7',
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC-ZZS-QN5GkMKH2-S5P8iLUlTDZxX3gZKdUrO-fknpwDmCB_OgjkWJShwZZ_WkFp22P4SietMWEUndqAVaqvuCeO6OCUE816TVDANNx1dJ5jPRJwLGsw0816No8J5S3oPjJs5hcXnnhjVhzeOmFDrm29HGauQHTu11QZj4CYMFZskwJwujvFtvueTXceiAEcOUDndqWQG4ISr5ZIkdeX-ptySeKg0F3zmGXAusqttrgT-m0yrzxaJvXQ',
    ],
    createdAt: 'Publicado hoy',
    authorName: 'Sofía Navarro',
    status: 'disponible',
  },
  {
    id: 'garment-4',
    title: 'Camisa masculina para rediseño asimétrico',
    category: 'camisas',
    condition: 'Excelente (Sin uso)',
    size: 'Talla XL',
    composition: 'Popelín fino',
    description: 'Algodón egipcio de altísima calidad. Busco patronista para transformar mangas y entallar espalda.',
    country: 'España',
    department: 'Andalucía',
    city: 'Sevilla',
    neighborhood: 'Triana',
    address: 'Calle Betis, 45',
    colorName: 'Blanco',
    colorHex: '#FFFFFF',
    photos: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCjVobKXziiikeUd9ZWX9kMCczBU3CWDluzYR5QrpfiNYByIsSjO9hHyI_gsS8ulx-TCWt4LsFCQlvUkZCRvvyPwpulkGqywiOEp5py-K90X3TH-tkbpYEF7CwVYKJGBfL8JlVD3TPmK9eaaq-_RIO2Y14TeYXLqMJEQBT-1Urj0-6WvyoLxSz4Gsagilg_PCsbfV-mPpssjnKCh_rdAVg0O0i3Ri2bZaGUPSsbeqPcMC6Q9-1AlFM2sQ',
    ],
    createdAt: 'Publicado hace 3 días',
    authorName: 'Javier Morales',
    status: 'disponible',
  },
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-1',
    name: 'Elena Ramos',
    title: 'Maestra Modista & Upcycling',
    verified: true,
    country: 'España',
    department: 'Madrid',
    city: 'Madrid',
    neighborhood: 'Malasaña',
    tags: ['Patronaje a medida', 'Lino y seda', 'Transformación trench'],
    bio: 'Más de 18 años rediseñando prendas clásicas. Especialista en deconstrucción de abrigos y trajes de sastre para siluetas fluidas y modernas.',
    available: 'Disponible esta semana',
    rating: 4.98,
    projectsCount: 64,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChxbcTHqlAN3uMtOOOHZzq8efv2hefS-xSX629SlEO6KUuL9dlSS92d3AE2d8cjIMubiJJ9uxtQCWaM2p_CXwyy8vNxSaQMuIg3RnL1PI85Em82Z3HE8SVFVd4VOncVF8uOr6mG-UDjCfsL_0wfW5LZzcnCKD3RVa7HFyd2c5aS03D_JrqElWrNRlnzJpWQJdRfqkb603v-H8rHmTorWJsPIIq0LVlG5DR41-zqyztKJF8vgPVRdHVdw',
    specialties: ['Alta modistería', 'Upcycling deconstruido', 'Patronaje'],
    portfolioImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBDz-Y9idJ7dQU4FpRn-J-KxmGfgtsqgcjZ8m6N67UArUy32Spefetvs8MJUJ4ddq_VkaThFcTyPMbCvrkdMSUWK9FwJcN8fgs7CL5ES5rb-RkpE8e_bOaqtUCpHW1QHTIsiYdFeXocOjSXcN0T5mzg14UFLONEtJd7Wv5b4HCGcIVkc2JMcgO2X0aEPXY5ruQEN9bYqj-hkhUynxW3dLa4-45U0kBMwle61tY3a_T2ZimhjdUkTZa1yA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBT118q9c0tB74dVgoxMT2JN48be3lFekTyKWo97iH5EFP8gj8EJDWoHptlbNUcyFB39ZPn_0vUQlkfgF6-t3swiXAvXKg9AIvL9-TOc9yhK32q7DVXO7ZuncU2uXRapattykNECMQ2IurT5OU2BM_N9-vTxhZAeMNV7yiB0NgsA1iGJ2-xU0i1h-aeSTs7dVBjDVoKkGrhgIEvIddhkSFZNcnB2Fb1T0KbaRsP-HNVCSlvFBdqh3ms2w',
    ],
  },
  {
    id: 'prof-2',
    name: 'Marcos Varela',
    title: 'Sastre de Transformación',
    verified: true,
    country: 'España',
    department: 'Cataluña',
    city: 'Barcelona',
    neighborhood: 'Born',
    tags: ['Sastrería masculina/unisex', 'Lana virgen', 'Entalle milimétrico'],
    bio: 'Recupero trajes antiguos heredados y blazers vintage masculinos transformándolos en piezas contemporáneas con caída geométrica impecable.',
    available: 'Disponible esta semana',
    rating: 5.0,
    projectsCount: 42,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBYBvXakjFn73cxvk-GGub9cUl1ybRG8IWdlJyA9DsxbItvzOO0TdulnKaQU7Rx1k_ltYJ-qShUTQVtIuJ-Cw99wypjKdZC21o3EMHzVZrRhoLQyXI1TqKF_weqpeuMvt8UKs20UeXTIlWZLXGEKFVkiLOQZjBL1GufmWIOFaFKprPjSSzlT-hmtxG8TYVMMeecDNTeX3554DyVPX2WVDTvrDRuHBamMHwoDzROcF0EhumlZ02iExr_NQ',
    specialties: ['Sastrería y entalle', 'Trajes vintage', 'Lana'],
    portfolioImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1l-Cd0jac3V7bapWljBYY4AKkXGAu9I8Xh5zBsDQC-hi8ot7gFoQj7KXz96bFGYIqKNlde1LiHJB8WiY7-sSPA5wo_fDSayGS1NcdNhttjTQWMedA6s8iRif8wLeXgcX0Tak-aYrvJtxieBcvv8znx4MsPfbP4UrUtJ5d4ExCR-5i9ckMp424Yhjeti40HDNNJn2b00RCdUMQwv6ZyXK_znZm5SZqjq-Rwxl8Xus-sEv_q1gxBHFtnQ',
    ],
  },
  {
    id: 'prof-3',
    name: 'Lucía Beltrán',
    title: 'Bordado & Reparación Visible',
    verified: true,
    country: 'España',
    department: 'Comunidad Valenciana',
    city: 'Valencia',
    neighborhood: 'El Carmen',
    tags: ['Sashiko & Boro', 'Tintes botánicos', 'Rescate de denim'],
    bio: 'Transformo agujeros, roturas y manchas en obras de arte textil mediante bordado botánico y técnicas ancestrales de remiendo visible japonés.',
    available: '2 plazas libres',
    rating: 4.95,
    projectsCount: 58,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDS_PMa5VG-G6A0MX3KqUwY6IkOdBPMTYoLciTYANF4NHmwQnDwxmpj3YZlKx2WPU537aLkWhHTmRDzfxiHTzaOAItTt_ueAYp3jTNovYrRMDmXKVxVVcm0uHSqyJ9IRLIkqs4Mjc9bz7sgg_6ZSM_3mpse1ZiasRb-FXsSvmIcxeYnHxnBgToixYSaBWmW7AE8CDY9sGSI8xZigcN7_VP3fmbor0LpgDKIau7VJj9B6aB1FxV6OWxlig',
    specialties: ['Bordado artesanal y reparación', 'Upcycling deconstruido', 'Boro y Sashiko'],
    portfolioImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAkTenlFWGG_Qx0Oid91_DMobZ1ZjfMHdYiCja153W268LIKVbkljswEqicrApUBPtYf1jRHhIxd7ueakEl0W48QP9m97dZ7jj1cTTgEMMbeUzczppUfCI8-qIpKQM0GW8ngswuPWKUWN8JIf9MS8ung2Z6oasSLgkv49s-EXqV0yjDN5eYVl79eOAjLrcNYAqtHpLBPx5vugNEEpQb4vxwblB9t1-7AnEC7LyYf92ShOaLUEZEMZEjOw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDZCQAFocdXAPCy0wS-hnhBBYpHmTejxmy_cZGO8wFxKYWSu0jdySxl5WLnUbK1o7ctJx19O1G5RTSuPcnWeUuLtcNk_Xmgmve9b9SY2S3U-yar8C2e58Rm1Gpc0KJOaNlLJQuGbyXB9B6kvizOH_006Xdgk5CjX97_YyIDCRRV5irlkvWXZsxt6xPYz2TBeQFqzQnqWuYpSEOUREwjgRVYgN6k8I8VSjKQ3dk_LCi6L-rQCrURcR3t2g',
    ],
  },
];

export const INITIAL_TUTORIALS: Tutorial[] = [
  {
    id: 'tut-1',
    title: 'Cómo transformar una camisa oversize en blusa cropped',
    category: 'Patronaje · Camisas',
    difficulty: 'Fácil',
    duration: '45 min',
    description: 'Técnica básica de corte con dobladillo fruncido para renovar cualquier camisa olvidada.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBT118q9c0tB74dVgoxMT2JN48be3lFekTyKWo97iH5EFP8gj8EJDWoHptlbNUcyFB39ZPn_0vUQlkfgF6-t3swiXAvXKg9AIvL9-TOc9yhK32q7DVXO7ZuncU2uXRapattykNECMQ2IurT5OU2BM_N9-vTxhZAeMNV7yiB0NgsA1iGJ2-xU0i1h-aeSTs7dVBjDVoKkGrhgIEvIddhkSFZNcnB2Fb1T0KbaRsP-HNVCSlvFBdqh3ms2w',
    materials: ['Camisa oversize (100% algodón recomendada)', 'Tijeras de sastre', 'Cinta métrica', 'Tiza de marcar', 'Goma elástica o cordón de lino', 'Máquina de coser o aguja e hilo'],
    steps: [
      {
        number: 1,
        title: 'Medición de la altura deseada',
        instruction: 'Ponte la camisa y marca con alfileres o tiza el punto exacto donde deseas que termine la blusa (suele ser 3-4 cm por encima del ombligo). Agrega 3 cm extra para el dobladillo.',
      },
      {
        number: 2,
        title: 'Corte recto con precisión',
        instruction: 'Extiende la camisa sobre una superficie plana, alinea las costuras laterales y corta cuidadosamente siguiendo la línea marcada.',
      },
      {
        number: 3,
        title: 'Canal de dobladillo fruncido',
        instruction: 'Plancha un pliegue de 1 cm hacia el interior y luego otro de 2 cm. Pasa una costura recta dejando una apertura de 2 cm para introducir la cinta o elástico.',
      },
      {
        number: 4,
        title: 'Ajuste final y remate',
        instruction: 'Pasa el elástico con un imperdible, pruébate la prenda para calibrar la tensión del fruncido y cierra la costura.',
      },
    ],
  },
  {
    id: 'tut-2',
    title: 'Ideas para reutilizar un pantalón vaquero en bolso tote',
    category: 'Upcycling · Denim',
    difficulty: 'Intermedio',
    duration: '1h 30 min',
    description: 'Aprovecha los bolsillos traseros originales y refuerza asas resistentes para la compra diaria.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDZCQAFocdXAPCy0wS-hnhBBYpHmTejxmy_cZGO8wFxKYWSu0jdySxl5WLnUbK1o7ctJx19O1G5RTSuPcnWeUuLtcNk_Xmgmve9b9SY2S3U-yar8C2e58Rm1Gpc0KJOaNlLJQuGbyXB9B6kvizOH_006Xdgk5CjX97_YyIDCRRV5irlkvWXZsxt6xPYz2TBeQFqzQnqWuYpSEOUREwjgRVYgN6k8I8VSjKQ3dk_LCi6L-rQCrURcR3t2g',
    materials: ['Pantalón tejano antiguo', 'Hilo de torzal para denim', 'Tijeras de tela pesada', 'Aguja de máquina 100/16 para denim', 'Tela de forro (opcional)', 'Cinta de algodón para asas'],
    steps: [
      {
        number: 1,
        title: 'Corte de las perneras',
        instruction: 'Corta las piernas del pantalón en línea recta justo por debajo del tiro, preservando íntegramente la cinturilla y los bolsillos traseros.',
      },
      {
        number: 2,
        title: 'Unión de la base',
        instruction: 'Abre el tiro central y cose en recto para crear un fondo plano de gran resistencia.',
      },
      {
        number: 3,
        title: 'Confección de asas con las perneras',
        instruction: 'Usa las perneras sobrantes cortando dos tiras de 60 cm x 8 cm. Dóblalas longitudinalmente hacia adentro y pespuntea.',
      },
      {
        number: 4,
        title: 'Fijación de asas y acabado',
        instruction: 'Cose las asas reforzadas por el interior de la pretina con costuras en cruz ("box stitch") para máxima carga.',
      },
    ],
  },
  {
    id: 'tut-3',
    title: 'Bordado botánico visible para reparar roturas',
    category: 'Reparación · Bordado',
    difficulty: 'Principiante',
    duration: '30 min',
    description: 'Convierte pequeños desgastes o enganchones en motivos florales con hilos de algodón orgánico.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAkTenlFWGG_Qx0Oid91_DMobZ1ZjfMHdYiCja153W268LIKVbkljswEqicrApUBPtYf1jRHhIxd7ueakEl0W48QP9m97dZ7jj1cTTgEMMbeUzczppUfCI8-qIpKQM0GW8ngswuPWKUWN8JIf9MS8ung2Z6oasSLgkv49s-EXqV0yjDN5eYVl79eOAjLrcNYAqtHpLBPx5vugNEEpQb4vxwblB9t1-7AnEC7LyYf92ShOaLUEZEMZEjOw',
    materials: ['Prenda dañada (jersey, abrigo o pantalón)', 'Bastidor de bordado pequeño', 'Madejas de hilo mouliné orgánico', 'Aguja de bordar con punta fina', 'Estabilizador hidrosoluble'],
    steps: [
      {
        number: 1,
        title: 'Estabilización de la rotura',
        instruction: 'Coloca el bastidor alrededor del desperfecto sin tensar excesivamente el tejido para no deformarlo.',
      },
      {
        number: 2,
        title: 'Trazado del motivo botánico',
        instruction: 'Dibuja con lápiz termosoluble una pequeña rama con hojas o flor que cubra el punto dañado.',
      },
      {
        number: 3,
        title: 'Puntada de satén y tallo',
        instruction: 'Cose el tallo con punto atrás y rellena los pétalos con puntada margarita o satén compacto, sellando las hebras sueltas.',
      },
      {
        number: 4,
        title: 'Fijación final',
        instruction: 'Remata con un nudo plano en el reverso y aplica un suave toque de vapor sin frotar.',
      },
    ],
  },
  {
    id: 'tut-4',
    title: 'Cómo aprovechar retazos de lino y algodón',
    category: 'Cero Residuo · Hogar',
    difficulty: 'Todos los niveles',
    duration: '40 min',
    description: 'Confección de fundas de cojín geométricas o servilletas de mesa a partir de sobrantes de corte.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBYT_c3Qjbq_riT8dTg9rWIu_aWxwBEg1fXwS8pEKXIq0-2HNkfcqLnHhIIrFEqc5ehSbOd0pWXHhrRFTRyIiQ7O0Nh5mkCzm-iZYJEK8kkQfdZxDALGa5dVSatUzQhX3P7DdYEE3OMqD37t5acX4NmK_SGJzmuTwD6mhzjqPA_s-GX7IJhh4o8VxoVrW5u6K6I8NRmnuTwTSQ6SFwsWkx9XSR1c4DMYDqwZ4VmingCjgQNxFi40Hpl9Q',
    materials: ['Retazos variados de lino y algodón natural', 'Cúter rotatorio y regla de patchwork', 'Plancha', 'Hilo al tono o en contraste'],
    steps: [
      {
        number: 1,
        title: 'Clasificación de piezas por gramaje',
        instruction: 'Agrupa los retazos que tengan grosores compatibles para que la caída de la tela sea homogénea.',
      },
      {
        number: 2,
        title: 'Diseño de composición geométrica',
        instruction: 'Juega en plano armando bloques de color inspirados en el arte boro japonés o minimalismo escandinavo.',
      },
      {
        number: 3,
        title: 'Costura plana y planchado continuo',
        instruction: 'Une tira por tira con margen de 0.7 cm, abriendo las costuras con la plancha tras cada unión.',
      },
      {
        number: 4,
        title: 'Armado de la pieza final',
        instruction: 'Cuadra el panel al tamaño deseado (ej. 45x45 cm para cojín o 40x40 cm para mantel individual) y remata el dobladillo perimetral.',
      },
    ],
  },
];

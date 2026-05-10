// ===========================================
// Constants & Static Data
// ===========================================

// Fallback image used throughout the project
export const FALLBACK_IMAGE = 'img/LOGO NEXT GEN .png';

// CSV URLs
export const CSV_URLS = {
    comunidad: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR1m8c_M-L39OfXRC4qqGkMuT2liOaogntkZntOeHOiQ7hXTrUFKJrIjOG4amjpCJ7LmTPKzF5GcD9/pub?gid=1269159520&single=true&output=csv',
    vitrina: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5wG7maDoWY1HJrLAF9bJBFKs8B1loTiOn1SYuzS9_gr50-JwMAoArtKAP8wLIBYSVqHT_FIbNlyaC/pub?gid=372344697&single=true&output=csv',
    counter: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkc4vazCHrgzXe9gkhMqZPKEQFor5493mm9iwZ8AqUO3wLMl4WbmJvv6leMBrmRlwX9bOF0-mzsZOF/pub?gid=0&single=true&output=csv',
    beneficiariosFinales: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0qH-yBdPQFwbwJ2bHGWrCLk4S-OQJFakLCQcWn4szFyOiaxFNqvax-rEbnlnPpg/pub?gid=1774240487&single=true&output=csv',
    resultados: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDza2h6HARc-jFfdjnAusdL2SS0LGlXkSb_eX2IkRfSK3kGBvwrkAuW3-MuOOYSQ/pub?gid=740909374&single=true&output=csv',
    terceraFase: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKQxlCAQ8_MamsnjZ0UtEtmyxZJEnZJWPQtzRqphHWj_xGj9xiqnmML6ZMhpkXopfVPCbYFCzCf9FE/pub?gid=0&single=true&output=csv',
    media: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS33BPFo7F4KzE3NknoEpKfzTjb5EjeUR1svAlMf8a6Wh-NgFPhKAJzojCJG5qdiLyWw0eSOpFCwG2G/pub?gid=1170999841&single=true&output=csv'
};

// Postulation form URLs
export const POSTULACION_URLS = {
    gmail: 'https://docs.google.com/forms/d/e/1FAIpQLSdVjfjqlgQ2XJ_y4xy5TyJfNCVb38AsW-nUNLmMu9mtOL2mRw/viewform?usp=sharing&ouid=111036678654536609466',
    noGmail: 'https://form.jotform.com/260436307811048'
};

// Map municipios data
export const MUNICIPIOS_MAP = [
    { name: "Ábrego", lat: 8.081, lng: -73.216 },
    { name: "Arboledas", lat: 7.643, lng: -72.784 },
    { name: "Bochalema", lat: 7.610, lng: -72.645 },
    { name: "Cáchira", lat: 7.740, lng: -73.048 },
    { name: "Chitagá", lat: 7.135, lng: -72.663 },
    { name: "Convención", lat: 8.435, lng: -73.214 },
    { name: "Cúcuta", lat: 7.8939, lng: -72.5078 },
    { name: "El Carmen", lat: 8.509, lng: -73.447 },
    { name: "El Zulia", lat: 7.930, lng: -72.600 },
    { name: "La Playa de Belén", lat: 8.232, lng: -73.238 },
    { name: "Los Patios", lat: 7.8464, lng: -72.5036 },
    { name: "Ocaña", lat: 8.2373, lng: -73.3560 },
    { name: "Pamplona", lat: 7.3756, lng: -72.6473 },
    { name: "Puerto Santander", lat: 8.356, lng: -72.436 },
    { name: "San Calixto", lat: 8.4, lng: -73.15 },
    { name: "Sardinata", lat: 8.083, lng: -72.8 },
    { name: "Salazar de las Palmas", lat: 7.776, lng: -72.813 },
    { name: "Teorama", lat: 8.435, lng: -73.284 },
    { name: "Tibú", lat: 8.6397, lng: -72.7358 },
    { name: "Toledo", lat: 7.307, lng: -72.482 },
    { name: "Villa del Rosario", lat: 7.8336, lng: -72.4739 }
];

// Rutas NextGen data
export const rutasData = {
    'Viernes 6 de febrero': [
        { municipio: 'Teorama', hora: '9:00 a.m.', lugar: 'Casa Cural' },
        { municipio: 'Puerto Santander', hora: '', lugar: '' },
        { municipio: 'San Calixto', hora: '2:00 p.m.', lugar: 'Casa de la Cultura' },
        { municipio: 'Villa del Rosario', hora: '2:00 p.m.', lugar: 'Auditorio Alcaldia Municipal de Villa del Rosario' }
    ],

    'Lunes 9 de febrero': [
        { municipio: 'El Carmen', hora: '9:00 a.m.', lugar: 'Casa del Bingo' },
        { municipio: 'El Zulia', hora: '2:00 p.m.', lugar: 'Casa de la Mujer Emprendedora' },
        { municipio: 'Convención', hora: '2:00 p.m.', lugar: 'Centro de Convivencia Ciudadana' },
        { municipio: 'Sardinata', hora: '4:00 p.m.', lugar: 'Oficina de Juventud' },
        { municipio: 'Tibú', hora: '', lugar: 'Seminario San Luis Beltrán - Salón de Eventos San José' }
    ],
    'Martes 10 de febrero': [
        { municipio: 'Salazar', hora: '9:00 a.m.', lugar: 'Salon de Eventos Juana Naranja' },
        { municipio: 'La Playa', hora: '9:00 a.m.', lugar: 'Auditorio IE Colegio Fray José Maria Arévalo' },
        { municipio: 'Ábrego', hora: '2:00 p.m.', lugar: 'Salon de Eventos Los Alpes' },
        { municipio: 'Los Patios', hora: '2:00 p.m.', lugar: 'Salón de Eventos Belén Av. 10 No. 17a -39' },
        { municipio: 'Arboledas', hora: '2:00 p.m.', lugar: 'Teatro Municipal de Arboledas' }
    ],
    'Miércoles 11 de febrero': [
        { municipio: 'Pamplona', hora: '8:00 a.m.', lugar: 'Centro Día (Antigua plaza de toros)' },
        { municipio: 'Ocaña', hora: '9:00 a.m.', lugar: 'Auditorio Colegio Argelino Durán El Bambo' },
        { municipio: 'Toledo', hora: '9+:00 a.m.', lugar: 'Centro Dia (Antigua Plaza de Toros)' },
        { municipio: 'Puerto Santander', hora: '2:00 p.m', lugar: 'Calle 7 , carrera 4a, #4-69, Barrio el Carmen' }
    ],
    'Jueves 12 de febrero': [
        { municipio: 'Cúcuta', hora: '10:00 a.m.', lugar: 'Auditorio Edificio Administrativo - Pescadero' },
        { municipio: 'Chitagá', hora: '8:00 a.m', lugar: 'Carrera 7, barrio Centro, a media cuadra del parque principal de Chitagá, Restarante Lismao' },
        { municipio: 'Bochalema', hora: '1:00 p.m', lugar: 'Carrera 2 # 2-20, Barrio San Bartolomeo' },
        { municipio: 'Cáchira', hora: '10:30 a.m', lugar: 'Hogar Infantil San Pedro claver, Barrio San Auguistin' }
    ]
};

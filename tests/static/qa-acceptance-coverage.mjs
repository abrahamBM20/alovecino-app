import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = {
  workflow: '.github/workflows/qa-release-candidate.yml',
  postman: 'tests/postman/alovecino-api.postman_collection.json',
  k6: 'tests/k6/alovecino-smoke.js',
  appium: 'tests/e2e/appium/alovecino-smoke.test.js',
};

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

const contents = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, read(file)]));

const coverage = [
  {
    hu: 'AV-85/HU-26 configuracion usuario',
    required: [
      ['workflow', 'Run frontend coverage'],
      ['postman', 'Configuracion usuario autenticado'],
      ['appium', 'Configuraci'],
    ],
  },
  {
    hu: 'AV-88/HU-29 consultas alineadas al MER',
    required: [
      ['workflow', 'Run backend coverage'],
      ['postman', 'Consultas MER rechaza payload legacy'],
      ['postman', 'Consultas cliente devuelve detalles normalizados'],
    ],
  },
  {
    hu: 'HU cliente consultas',
    required: [
      ['postman', 'Consulta estructurada se crea cuando smoke esta habilitado'],
      ['postman', 'Consultas cliente devuelve detalles normalizados'],
      ['appium', 'Mis consultas'],
    ],
  },
  {
    hu: 'Dashboard y perfil almacenero',
    required: [
      ['postman', 'Almacenero obtiene mis almacenes'],
      ['postman', 'Dashboard almacenero devuelve metricas reales'],
      ['appium', 'Panel almacenero'],
    ],
  },
  {
    hu: 'AV-93/HU-34 aprobacion y visibilidad de almacenes',
    required: [
      ['postman', 'Registro de almacen queda pendiente cuando smoke esta habilitado'],
      ['postman', 'Admin puede cambiar estado de almacen cuando esta configurado'],
      ['postman', 'Geo stores acepta radios extendidos'],
    ],
  },
  {
    hu: 'AV-94/HU-35 geocodificacion real',
    required: [
      ['postman', 'Registro de almacen usa geocodificacion real cuando smoke esta habilitado'],
      ['postman', 'Geo stores returns map-ready nearby stores when authenticated'],
    ],
  },
  {
    hu: 'AV-95/HU-36 error legible de geocodificacion',
    required: [
      ['postman', 'Registro de almacen informa error legible si direccion no geocodifica'],
    ],
  },
  {
    hu: 'AV-96/HU-37 home panel e historial',
    required: [
      ['appium', 'Almacenes cercanos'],
      ['appium', 'Mis consultas'],
      ['k6', '/api/geo/stores'],
    ],
  },
  {
    hu: 'AV-98/HU-39 export web para EAS update',
    required: [
      ['workflow', 'Run frontend coverage'],
      ['workflow', 'Semgrep'],
      ['appium', 'Crear cuenta'],
    ],
  },
];

const rows = [];
const missing = [];

for (const item of coverage) {
  for (const [fileKey, token] of item.required) {
    const ok = contents[fileKey].includes(token);
    rows.push({ hu: item.hu, file: files[fileKey], token, ok });
    if (!ok) {
      missing.push({ hu: item.hu, file: files[fileKey], token });
    }
  }
}

const evidenceDir = path.join(root, 'qa-evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const markdown = [
  '# QA Release Candidate - Acceptance Coverage',
  '',
  '| HU | Evidencia | Señal | Estado |',
  '| --- | --- | --- | --- |',
  ...rows.map((row) => `| ${row.hu} | ${row.file} | \`${row.token}\` | ${row.ok ? 'OK' : 'FALTA'} |`),
  '',
  `Resultado: ${missing.length === 0 ? 'OK' : 'FALTAN COBERTURAS'}`,
  '',
].join('\n');

fs.writeFileSync(path.join(evidenceDir, 'qa-acceptance-coverage.md'), markdown);

if (missing.length > 0) {
  console.error(JSON.stringify({ missing }, null, 2));
  process.exit(1);
}

console.log(markdown);

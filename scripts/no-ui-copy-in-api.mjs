import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "src", "api");

const forbiddenPatterns = [
  { label: "i18n call in API", regex: /\bt\s*\(/g },
  { label: "UI-friendly prefix", regex: /friendlyMessage/gi },
  { label: "Spanish UI phrase", regex: /No se pudo|Cargando|Iniciá sesión|Volvé a iniciar sesión|carrito está vacío/gi },
  { label: "English UI phrase", regex: /Could not|Unexpected error|Sign in again|Loading|Your cart is empty/gi }
];

function collectApiFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectApiFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = collectApiFiles(apiDir);
const findings = [];

for (const filePath of files) {
  const relativePath = path.relative(root, filePath).replaceAll("\\", "/");
  const content = fs.readFileSync(filePath, "utf8");

  for (const { label, regex } of forbiddenPatterns) {
    regex.lastIndex = 0;
    const hasMatch = regex.test(content);
    if (hasMatch) {
      findings.push(`${relativePath}: patrón prohibido detectado -> ${label}`);
    }
  }
}

if (findings.length > 0) {
  console.error("❌ Se detectó copy/UI acoplada en src/api:\n");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("✅ Validación API OK: no se detectó copy de UI en src/api.");

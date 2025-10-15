// Función para normalizar texto removiendo acentos
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD") // Descompone caracteres con acentos
    .replace(/[\u0300-\u036f]/g, ""); // Remueve las marcas diacríticas (acentos)
}

function objectToString(obj: any): string {
  if (obj == null) return ""; 
  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(item => objectToString(item)).join(" ");
  }
  if (typeof obj === "object") {
    return Object.values(obj).map(value => objectToString(value)).join(" ");
  }
  return "";
}

function filtrarPorBusqueda<T>(items: T[], busqueda: string): T[] {
  const queryNormalizada = normalizarTexto(busqueda);
  return items.filter(item => {
    const textoItem = objectToString(item);
    const textoNormalizado = normalizarTexto(textoItem);
    return textoNormalizado.includes(queryNormalizada);
  });
}
export { filtrarPorBusqueda };
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
  const query = busqueda.toLowerCase();
  return items.filter(item =>
    objectToString(item).toLowerCase().includes(query)
  );
}
export { filtrarPorBusqueda };
import type { Afiliado, Integrante, AfiliadoListItem } from '../types/afiliados';

/**
 * Transforma los datos del backend para mostrar todos los afiliados (titulares e integrantes) en una lista plana
 */
export const transformarAfiliadosParaLista = (afiliados: Afiliado[]): AfiliadoListItem[] => {
  const listaCompleta: AfiliadoListItem[] = [];

  afiliados.forEach(titular => {
    // Agregar el titular
    const titularItem: AfiliadoListItem = {
      id: titular.id,
      credencial: titular.credencial,
      sufijo: titular.sufijo,
      tipoDocumento: titular.tipoDocumento,
      numeroDocumento: titular.numeroDocumento,
      nombre: titular.nombre,
      apellido: titular.apellido,
      fechaNacimiento: titular.fechaNacimiento,
      telefono: titular.telefono,
      email: titular.email,
      direccion: titular.direccion,
      parentesco: titular.parentesco,
      situacionesTerapeuticas: titular.situacionesTerapeuticas,
      planMedico: titular.planMedico,
      fechaAlta: titular.fechaAlta,
      fechaBaja: titular.fechaBaja,
      esTitular: true
    };
    
    listaCompleta.push(titularItem);

    // Agregar los integrantes del grupo familiar
    if (titular.grupoFamiliar && titular.grupoFamiliar.length > 0) {
      titular.grupoFamiliar.forEach(integrante => {
        const integranteItem: AfiliadoListItem = {
          id: integrante.id,
          credencial: integrante.credencial,
          sufijo: integrante.sufijo,
          tipoDocumento: integrante.tipoDocumento,
          numeroDocumento: integrante.numeroDocumento,
          nombre: integrante.nombre,
          apellido: integrante.apellido,
          fechaNacimiento: integrante.fechaNacimiento,
          telefono: integrante.telefono,
          email: integrante.email,
          direccion: integrante.direccion,
          parentesco: integrante.parentesco,
          situacionesTerapeuticas: integrante.situacionesTerapeuticas,
          planMedico: integrante.planMedico,
          fechaAlta: integrante.fechaAlta,
          fechaBaja: integrante.fechaBaja,
          esTitular: false,
          titularId: titular.id
        };
        
        listaCompleta.push(integranteItem);
      });
    }
  });

  return listaCompleta;
};

/**
 * Encuentra el afiliado titular y su grupo familiar por ID (puede ser titular o integrante)
 */
export const encontrarAfiliadoConGrupo = (afiliados: Afiliado[], id: number): { titular: Afiliado; integranteActual?: Integrante } | null => {
  // Buscar si es un titular
  const titular = afiliados.find(a => a.id === id);
  if (titular) {
    return { titular };
  }

  // Buscar si es un integrante
  for (const afiliado of afiliados) {
    if (afiliado.grupoFamiliar) {
      const integrante = afiliado.grupoFamiliar.find(i => i.id === id);
      if (integrante) {
        return { titular: afiliado, integranteActual: integrante };
      }
    }
  }

  return null;
};

/**
 * Obtiene todos los miembros del grupo familiar (titular + integrantes) como AfiliadoListItem
 */
export const obtenerMiembrosGrupoFamiliar = (titular: Afiliado): AfiliadoListItem[] => {
  const miembros: AfiliadoListItem[] = [];
  
  // Agregar el titular
  miembros.push({
    id: titular.id,
    credencial: titular.credencial,
    sufijo: titular.sufijo,
    tipoDocumento: titular.tipoDocumento,
    numeroDocumento: titular.numeroDocumento,
    nombre: titular.nombre,
    apellido: titular.apellido,
    fechaNacimiento: titular.fechaNacimiento,
    telefono: titular.telefono,
    email: titular.email,
    direccion: titular.direccion,
    parentesco: titular.parentesco,
    situacionesTerapeuticas: titular.situacionesTerapeuticas,
    planMedico: titular.planMedico,
    fechaAlta: titular.fechaAlta,
    fechaBaja: titular.fechaBaja,
    esTitular: true
  });

  // Agregar los integrantes
  if (titular.grupoFamiliar && titular.grupoFamiliar.length > 0) {
    titular.grupoFamiliar.forEach(integrante => {
      miembros.push({
        id: integrante.id,
        credencial: integrante.credencial,
        sufijo: integrante.sufijo,
        tipoDocumento: integrante.tipoDocumento,
        numeroDocumento: integrante.numeroDocumento,
        nombre: integrante.nombre,
        apellido: integrante.apellido,
        fechaNacimiento: integrante.fechaNacimiento,
        telefono: integrante.telefono,
        email: integrante.email,
        direccion: integrante.direccion,
        parentesco: integrante.parentesco,
        situacionesTerapeuticas: integrante.situacionesTerapeuticas,
        planMedico: integrante.planMedico,
        fechaAlta: integrante.fechaAlta,
        fechaBaja: integrante.fechaBaja,
        esTitular: false,
        titularId: titular.id
      });
    });
  }

  return miembros;
};
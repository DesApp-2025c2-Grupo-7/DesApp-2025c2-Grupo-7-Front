import type { Afiliado, Integrante, AfiliadoListItem, GrupoFamiliar } from '../types/afiliados';
import type { PersonaConGrupo } from '../services/personasService';

/**
 * Transforma los datos del backend para mostrar todos los afiliados (titulares e integrantes) en una lista plana
 */
export const transformarAfiliadosParaLista = (afiliados: Afiliado[]): AfiliadoListItem[] => {
  const listaCompleta: AfiliadoListItem[] = [];
  const procesados = new Set<string>(); // Para evitar duplicados

  afiliados.forEach(titular => {
    // Verificar si el titular ya está incluido en su propio grupoFamiliar
    let titularYaIncluido = false;
    if (titular.grupoFamiliar && titular.grupoFamiliar.length > 0) {
      titularYaIncluido = titular.grupoFamiliar.some(miembro => 
        miembro.id === titular.id || 
        (miembro.credencial === titular.credencial && miembro.sufijo === titular.sufijo)
      );
    }

    // Solo agregar el titular manualmente si NO está ya incluido en grupoFamiliar
    if (!titularYaIncluido) {
      const titularKey = `${titular.credencial}-${titular.sufijo}`;
      if (!procesados.has(titularKey)) {
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
          parentesco: "Titular",
          situacionesTerapeuticas: titular.situacionesTerapeuticas,
          planMedico: titular.planMedico,
          fechaAlta: titular.fechaAlta,
          fechaBaja: titular.fechaBaja,
          esTitular: true
        };
        
        listaCompleta.push(titularItem);
        procesados.add(titularKey);
      }
    }

    // Agregar todos los miembros del grupo familiar (que puede incluir o no al titular)
    if (titular.grupoFamiliar && titular.grupoFamiliar.length > 0) {
      titular.grupoFamiliar.forEach(miembro => {
        const miembroKey = `${miembro.credencial}-${miembro.sufijo}`;
        if (!procesados.has(miembroKey)) {
          const integranteItem: AfiliadoListItem = {
            id: miembro.id,
            credencial: miembro.credencial,
            sufijo: miembro.sufijo,
            tipoDocumento: miembro.tipoDocumento,
            numeroDocumento: miembro.numeroDocumento,
            nombre: miembro.nombre,
            apellido: miembro.apellido,
            fechaNacimiento: miembro.fechaNacimiento,
            telefono: miembro.telefono,
            email: miembro.email,
            direccion: miembro.direccion,
            parentesco: miembro.id === titular.id ? "Titular" : (miembro.parentesco || "Integrante"),
            situacionesTerapeuticas: miembro.situacionesTerapeuticas,
            planMedico: miembro.planMedico,
            fechaAlta: miembro.fechaAlta,
            fechaBaja: miembro.fechaBaja,
            esTitular: miembro.id === titular.id,
            titularId: miembro.id === titular.id ? undefined : titular.id
          };
          
          listaCompleta.push(integranteItem);
          procesados.add(miembroKey);
        }
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
}

/**
 * Transforma una persona del backend al formato Afiliado del frontend
 */
export const transformPersonaToAfiliado = (persona: PersonaConGrupo): Afiliado => {
  return {
    id: persona.id,
    credencial: persona.credencial,
    sufijo: persona.sufijo,
    tipoDocumento: persona.tipoDocumento,
    numeroDocumento: persona.numeroDocumento,
    nombre: persona.nombre,
    apellido: persona.apellido,
    fechaNacimiento: persona.fechaNacimiento,
    telefono: persona.telefono || [],
    email: persona.email || [],
    direccion: persona.direccion || [],
    parentesco: persona.tipoPersona === 'AFILIADO' ? 'Titular' : (persona.parentesco || 'Integrante'),
    situacionesTerapeuticas: persona.situacionesTerapeuticas || [],
    planMedico: persona.planMedico,
    fechaAlta: persona.fechaAlta,
    fechaBaja: persona.fechaBaja,
    grupoFamiliar: [] // Se llena por separado para evitar recursión infinita
  };
};

/**
 * Extrae información del grupo familiar desde una persona con su grupo
 */
export const extractGrupoFamiliarInfo = (personaConGrupo: PersonaConGrupo): GrupoFamiliar => {
  return {
    credencial: personaConGrupo.credencial,
    planMedico: personaConGrupo.planMedico,
    estado: 'Activo', // Por defecto activo
    fechaAlta: personaConGrupo.fechaAlta,
    fechaBaja: personaConGrupo.fechaBaja,
    personas: [personaConGrupo, ...(personaConGrupo.grupoFamiliar || [])].map(persona => ({
      id: persona.id,
      credencial: persona.credencial,
      sufijo: persona.sufijo,
      tipoPersona: persona.tipoPersona,
      tipoDocumento: persona.tipoDocumento,
      numeroDocumento: persona.numeroDocumento,
      nombre: persona.nombre,
      apellido: persona.apellido,
      fechaNacimiento: persona.fechaNacimiento,
      telefono: persona.telefono || [],
      email: persona.email || [],
      parentesco: persona.parentesco,
      direccion: persona.direccion || [],
      situacionesTerapeuticas: persona.situacionesTerapeuticas || [],
      grupoFamiliar: {} as GrupoFamiliar,
      grupoFamiliarId: persona.credencial,
      planMedico: persona.planMedico,
      fechaAlta: persona.fechaAlta,
      fechaBaja: persona.fechaBaja
    }))
  };
};

/**
 * Obtiene todos los miembros del grupo familiar (titular + integrantes)
 */
export const getAllMiembrosGrupo = (personaConGrupo: PersonaConGrupo): Afiliado[] => {
  const titular = transformPersonaToAfiliado(personaConGrupo);
  const integrantes = (personaConGrupo.grupoFamiliar || []).map(transformPersonaToAfiliado);
  
  return [titular, ...integrantes];
};

/**
 * Determina si una persona es titular basándose en tipoPersona del backend
 */
export const esTitularPersona = (persona: any): boolean => {
  return persona.tipoPersona === 'AFILIADO' || persona.parentesco === 'Titular';
};

/**
 * Obtiene el texto del parentesco para mostrar en la UI
 */
export const obtenerParentescoTexto = (persona: any): string => {
  if (persona.tipoPersona === 'AFILIADO') {
    return 'Titular';
  }
  return persona.parentesco || 'Integrante';
};;
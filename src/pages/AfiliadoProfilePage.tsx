import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../components/genericos/Header";
import SubHeader from "../components/genericos/SubHeader";
import AfiliadosForm from "../components/afiliados/AfiliadosForm";
import "./AfiliadoProfile.css"; 
import type {Afiliado,GrupoFamiliar } from "../types/afiliados";
import { useModal } from "../hooks/useModal";
import Modal from "../components/genericos/Modal";
import { getApiUrl } from "../config/env";
import { personasService } from "../services/personasService";

/**
 * Función auxiliar para limpiar los datos de un afiliado antes de enviarlos al backend
 * Elimina todas las relaciones y propiedades que puedan causar errores en TypeORM
 */
const limpiarDatosParaBackend = (afiliado: Afiliado) => {
  // Extraer y excluir todas las relaciones y propiedades problemáticas
  const { 
    direccion, 
    situacionesTerapeuticas, 
    grupoFamiliar, 
    miembrosGrupo, 
    ...datosBasicos 
  } = afiliado;
  
  // Crear una copia limpia
  const datosLimpios = { ...datosBasicos };
  
  // Eliminar propiedades problemáticas pero mantener arrays de primitivos
  Object.keys(datosLimpios).forEach(key => {
    const valor = (datosLimpios as any)[key];
    
    if (Array.isArray(valor)) {
      // Mantener arrays de primitivos (como telefono, email)
      // Eliminar arrays de objetos (como direcciones, situaciones terapéuticas)
      const esPrimitivo = valor.length === 0 || typeof valor[0] !== 'object';
      if (!esPrimitivo) {
        delete (datosLimpios as any)[key];
      }
    } else if (typeof valor === 'object' && valor !== null) {
      // Eliminar objetos con índices numéricos (como grupoFamiliar.0, grupoFamiliar.1)
      if (Object.keys(valor).some(k => !isNaN(Number(k)))) {
        delete (datosLimpios as any)[key];
      }
    } else if (typeof valor === 'function') {
      // Eliminar funciones
      delete (datosLimpios as any)[key];
    }
  });
  
  return datosLimpios;
};

const AfiliadoProfile: React.FC = () => {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null); // Titular original (para referencia del grupo)
  const [afiliadoMostrado, setAfiliadoMostrado] = useState<Afiliado | null>(null); // El afiliado que se muestra (puede ser titular o integrante)
  const [grupoFamiliar, setGrupoFamiliar] = useState<GrupoFamiliar | null>(null);
  const [miembrosGrupo, setMiembrosGrupo] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [abrirIntegranteSolicitado, setAbrirIntegranteSolicitado] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Hook para el modal universal
  const modalUniversal = useModal();
  
  // Nuevo estado para manejar el modo de edición
  const modoEdicion = searchParams.get('modo') === 'editar';

  useEffect(() => {
    if (!id) return;

    const fetchAfiliado = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(`/personas/${id}`));
        if (!response.ok) {
          throw new Error("Error al obtener los datos del afiliado");
        }
        const titular: Afiliado = await response.json();
        
        // Obtener el grupo familiar completo usando la API específica
        const grupoResponse = await fetch(getApiUrl(`/personas/grupo/${titular.credencial}`));
        let grupoCompleto = titular;
        
        if (grupoResponse.ok) {
          grupoCompleto = await grupoResponse.json();
          // grupoCompleto contiene: titular + propiedad grupoFamiliar con los integrantes
        }
        
        setAfiliado(grupoCompleto);

        // Crear el grupo familiar
        const grupoData: GrupoFamiliar = {
          id: grupoCompleto.id,
          credencial: grupoCompleto.credencial,
          plan: grupoCompleto.planMedico,
          planMedico: grupoCompleto.planMedico,
          fechaCreacion: grupoCompleto.fechaAlta,
          fechaAlta: grupoCompleto.fechaAlta,
          fechaAltaPlan: grupoCompleto.fechaAlta,
          fechaBaja: grupoCompleto.fechaBaja,
          activo: !grupoCompleto.fechaBaja
        };
        setGrupoFamiliar(grupoData);
        
        // Crear la lista completa del grupo familiar evitando duplicaciones
        const miembrosCompletos: Afiliado[] = [];
        
        // Verificar si el titular ya está incluido en grupoFamiliar
        let titularYaIncluido = false;
        if (grupoCompleto.grupoFamiliar && grupoCompleto.grupoFamiliar.length > 0) {
          titularYaIncluido = grupoCompleto.grupoFamiliar.some((miembro: any) => 
            miembro.id === grupoCompleto.id || 
            (miembro.credencial === grupoCompleto.credencial && miembro.sufijo === grupoCompleto.sufijo)
          );
        }
        
        // Solo agregar el titular manualmente si NO está ya incluido en grupoFamiliar
        if (!titularYaIncluido) {
          miembrosCompletos.push({
            ...grupoCompleto,
            grupoFamiliar: [], // Evitar recursión
            parentesco: "Titular"
          });
        }
        
        // Agregar todos los miembros del grupo familiar (que puede incluir o no al titular)
        if (grupoCompleto.grupoFamiliar && grupoCompleto.grupoFamiliar.length > 0) {
          const miembros: Afiliado[] = grupoCompleto.grupoFamiliar.map((miembro: any) => ({
            ...miembro,
            grupoFamiliar: [],
            parentesco: miembro.id === grupoCompleto.id ? "Titular" : (miembro.parentesco || 'Integrante')
          }));
          miembrosCompletos.push(...miembros);
        }
        
        setMiembrosGrupo(miembrosCompletos);
        
        // Determinar qué afiliado mostrar basado en el parámetro de URL
        const integranteId = searchParams.get('integrante');
        
        if (integranteId) {
          // Si hay parámetro integrante, buscar ese integrante en el grupo por credencial-sufijo
          const integranteEncontrado = miembrosCompletos.find(miembro => `${miembro.credencial}-${miembro.sufijo}` === integranteId);
          if (integranteEncontrado) {
            setAfiliadoMostrado(integranteEncontrado);
          } else {
            setAfiliadoMostrado(grupoCompleto); // Fallback al titular si no se encuentra el integrante
          }
        } else {
          // Si no hay parámetro, mostrar el titular
          setAfiliadoMostrado(grupoCompleto);
        }
      } catch (error) {
        console.error(error);
        setAfiliado(null);
        setAfiliadoMostrado(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAfiliado();
  }, [id, searchParams.toString()]);

  const handleVolver = () => navigate("/afiliados");

  const handleSolicitarAbrirIntegrante = () => {
    // Señal al formulario: tanto por prop como por evento DOM para compatibilidad
    setAbrirIntegranteSolicitado(true);
    try {
      window.dispatchEvent(new Event('abrirModalAgregarIntegrante'));
    } catch (e) {
      // no-op si el entorno no soporta dispatch
    }
  };

  const handleDarDeBaja = async () => {
    if (afiliadoMostrado) {
      const fechaBaja = new Date().toISOString().split("T")[0];
      try {
        console.log('Dando de baja persona con ID:', afiliadoMostrado.id);
        console.log('Fecha de baja:', fechaBaja);

        const response = await fetch(getApiUrl(`/personas/${afiliadoMostrado.id}`), {
          method: "PUT", 
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fechaBaja }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error del servidor:', errorText);
          throw new Error(`Error al dar de baja: ${response.status} - ${errorText}`);
        }

        const afiliadoActualizado = await response.json();
        console.log('Afiliado actualizado:', afiliadoActualizado);
        
        setAfiliadoMostrado({ ...afiliadoMostrado, fechaBaja });
        modalUniversal.mostrarExito(
          "Afiliado dado de baja",
          "El afiliado será dado de baja exitosamente",
          `Fecha de baja: ${fechaBaja}`
        );
      } catch (error) {
        console.error("Error al dar de baja:", error);
        modalUniversal.mostrarError(
          "Error al dar de baja",
          "No se pudo dar de baja al afiliado. Por favor, intenta nuevamente."
        );
      }
    }
  };

  // Funciones para el modo de edición
  const handleGuardarCambios = async (afiliadoModificado: Afiliado) => {
    try {
      console.log('Enviando datos al backend:', afiliadoModificado);
      
      // Limpiar datos para enviar solo campos básicos al backend
      const datosLimpios = limpiarDatosParaBackend(afiliadoModificado);
      
      console.log('Datos originales:', afiliadoModificado);
      console.log('Datos limpios a enviar:', datosLimpios);
      console.log('INCLUIDOS: campos básicos + arrays de primitivos (telefono, email)');
      console.log('EXCLUIDOS: direccion, situacionesTerapeuticas, grupoFamiliar, arrays de objetos');
      
      // 1. Actualizar datos básicos del afiliado (solo campos primitivos)
      const response = await fetch(getApiUrl(`/personas/${afiliadoModificado.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosLimpios),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error al actualizar el afiliado: ${response.status} - ${errorText}`);
      }

      // 2. Manejar direcciones por separado usando endpoints específicos
      if (afiliadoModificado.direccion && afiliadoModificado.direccion.length > 0) {
        console.log('Sincronizando direcciones:', afiliadoModificado.direccion);
        
        try {
          // Procesar direcciones una por una
          
          // Procesar cada dirección del cliente
          for (const direccion of afiliadoModificado.direccion) {
            if (direccion.id && direccion.id > 0) {
              // Dirección existente - actualizar
              console.log('Actualizando dirección existente:', direccion.id);
              await personasService.updateDireccion(afiliadoModificado.id, direccion.id, direccion);
            } else {
              // Dirección nueva - crear
              console.log('Creando nueva dirección:', direccion);
              await personasService.createDireccion(afiliadoModificado.id, direccion);
            }
          }
          
          console.log('Direcciones sincronizadas exitosamente');
        } catch (errorDirecciones) {
          console.error('Error al sincronizar direcciones:', errorDirecciones);
          // No fallar todo el guardado por errores de direcciones, solo avisar
          modalUniversal.mostrarModal({
            titulo: 'Advertencia',
            mensaje: 'Los datos básicos se guardaron, pero hubo un problema al sincronizar las direcciones.',
            tipo: 'warning',
            soloInformacion: true
          });
        }
      }
      
      console.log('Datos básicos actualizados exitosamente');

      // Actualizar el estado local con los datos completos (incluyendo direcciones)
      setAfiliadoMostrado(afiliadoModificado);
      if (afiliadoModificado.id === afiliado?.id) {
        setAfiliado(afiliadoModificado);
      }

      // Salir del modo de edición
      const nuevosParams = new URLSearchParams(searchParams);
      nuevosParams.delete('modo');
      setSearchParams(nuevosParams);

      // Mostrar modal de éxito y recargar la página cuando el usuario confirme
      modalUniversal.mostrarModal({
        titulo: 'Cambios guardados',
        mensaje: 'Los cambios se guardaron exitosamente en el sistema.',
        submensaje: 'Presione Aceptar para ver los cambios actualizados.',
        tipo: 'success',
        soloInformacion: true,
        textoBotonConfirmar: 'Aceptar',
        onConfirmar: () => window.location.reload()
      });
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      modalUniversal.mostrarError(
        "Error al guardar",
        "No se pudieron guardar los cambios. Por favor, verifica los datos e intenta nuevamente."
      );
    }
  };

  const handleCancelarEdicion = () => {
    // Salir del modo de edición sin guardar
    const nuevosParams = new URLSearchParams(searchParams);
    nuevosParams.delete('modo');
    setSearchParams(nuevosParams);
  };

  const handleActivarEdicion = () => {
    // Activar el modo de edición agregando el parámetro 'modo=editar' a la URL
    const nuevosParams = new URLSearchParams(searchParams);
    nuevosParams.set('modo', 'editar');
    setSearchParams(nuevosParams);
  };

  const handleIntegranteCreado = (nuevoIntegrante: any) => {
    // Mostrar modal de éxito y navegar cuando el usuario confirme
    modalUniversal.mostrarModal({
      titulo: 'Integrante agregado',
      mensaje: 'Se agregó un nuevo integrante al grupo familiar.',
      submensaje: 'Presione Aceptar para ver el perfil del integrante.',
      tipo: 'success',
      soloInformacion: true,
      textoBotonConfirmar: 'Aceptar',
      onConfirmar: () => {
        // Queremos navegar al perfil del TITULAR y pasar el integrante por query
        // Construir la key integrante como credencial-sufijo si está disponible en la respuesta
        const cred = nuevoIntegrante?.credencial || nuevoIntegrante?.credencialTitular || afiliado?.credencial;
        const suf = nuevoIntegrante?.sufijo || nuevoIntegrante?.sufijoAsignado || nuevoIntegrante?.sufijoAsignado || '';

        // Preferir navegar al titular que tenemos en estado `afiliado` (titular completo)
        const idTitular = afiliado?.id || nuevoIntegrante?.titularId || nuevoIntegrante?.titular?.id;

        if (idTitular && cred) {
          const integranteKey = `${cred}-${suf}`;
          navigate(`/afiliados/${idTitular}?integrante=${integranteKey}`);
        } else if (idTitular) {
          // Si no tenemos credencial/sufijo, navegar al titular (sin query)
          navigate(`/afiliados/${idTitular}`);
        } else {
          // Fallback: recargar la página para reflejar el nuevo integrante
          window.location.reload();
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <Header title="Panel de Administración" subtitle="Afiliado - Información personal y estado" />
        <div className="admin-content">
          <SubHeader
            title="Afiliado"
            onVolver={handleVolver}
            onAlta={handleSolicitarAbrirIntegrante}
            buttonText="Dar de alta integrante"
            modoEdicion={modoEdicion}
          />
          <div className="afiliado-form">
            {Array.from({ length: 12 }).map((_, i) => (
              <div className="form-row" key={i}>
                <label>&nbsp;</label>
                <span className="skeleton">&nbsp;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Afiliado - Información personal y estado"
      />
      <div className="admin-content">
        <SubHeader
          title={`${afiliado?.nombre} ${afiliado?.apellido}`}
          subtitle={
            ((afiliadoMostrado as any)?.tipoPersona === "AFILIADO") || (afiliadoMostrado?.parentesco === "Titular")
              ? ''
              : `Integrante del grupo familiar de ${afiliado?.nombre} ${afiliado?.apellido}`
          }
          typeTag={((afiliadoMostrado as any)?.tipoPersona === "AFILIADO") || (afiliadoMostrado?.parentesco === "Titular") ? undefined : 'INTEGRANTE'}
          statusLabel={(function(){
            const today = new Date().toISOString().split('T')[0];
            if (!afiliadoMostrado) return '';
            
            // Si la fecha de alta está en el futuro, mostrar que estará activo desde esa fecha
            if (afiliadoMostrado.fechaAlta && afiliadoMostrado.fechaAlta > today) {
              return `ACTIVO A PARTIR DE ${afiliadoMostrado.fechaAlta}`;
            }
            
            if (!afiliadoMostrado.fechaBaja) return 'ACTIVO';
            return afiliadoMostrado.fechaBaja > today ? 'ACTIVO' : 'INACTIVO';
          })()}
          onVolver={handleVolver}
          onAlta={handleSolicitarAbrirIntegrante}
          buttonText="Dar de alta integrante"
          modoEdicion={modoEdicion}
        />
        {afiliadoMostrado && afiliado ? (
          <AfiliadosForm 
            afiliado={afiliadoMostrado} 
            afiliadoTitular={afiliado}
            grupoFamiliar={grupoFamiliar}
            miembrosGrupo={miembrosGrupo}
            onDarDeBaja={handleDarDeBaja}
            modoEdicion={modoEdicion}
            onGuardarCambios={handleGuardarCambios}
            onCancelarEdicion={handleCancelarEdicion}
            onActivarEdicion={handleActivarEdicion}
            onIntegranteCreado={handleIntegranteCreado}
            externalOpenAgregarIntegrante={abrirIntegranteSolicitado}
            onExternalOpenHandled={() => setAbrirIntegranteSolicitado(false)}
          />
        ) : (
          <p>No se encontró el afiliado</p>
        )}
      </div>

      {/* Modal Universal */}
      <Modal
        isOpen={modalUniversal.isOpen}
        onClose={modalUniversal.cerrarModal}
        onConfirm={modalUniversal.confirmarModal}
        titulo={modalUniversal.config?.titulo || ''}
        mensaje={modalUniversal.config?.mensaje || ''}
        submensaje={modalUniversal.config?.submensaje}
        tipo={modalUniversal.config?.tipo || 'info'}
        textoBotonConfirmar={modalUniversal.config?.textoBotonConfirmar}
        textoBotonCancelar={modalUniversal.config?.textoBotonCancelar}
        icono={modalUniversal.config?.icono}
        contenidoExtra={modalUniversal.config?.contenidoExtra}
        soloInformacion={modalUniversal.config?.soloInformacion}
        listaErrores={modalUniversal.config?.listaErrores}
      />
    </div>
  );
};

export default AfiliadoProfile;

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../components/genericos/Header";
import HeaderAfiliado from "../components/afiliados/HeaderAfiliados";
import AfiliadosForm from "../components/afiliados/AfiliadosForm";
import "./AfiliadoProfile.css"; 
import type { Afiliado, GrupoFamiliar } from "../types/afiliados";
import { useModal } from "../hooks/useModal";
import Modal from "../components/genericos/Modal";
import { getApiUrl } from "../config/env";
const AfiliadoProfile: React.FC = () => {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null); // Titular original (para referencia del grupo)
  const [afiliadoMostrado, setAfiliadoMostrado] = useState<Afiliado | null>(null); // El afiliado que se muestra (puede ser titular o integrante)
  const [grupoFamiliar, setGrupoFamiliar] = useState<GrupoFamiliar | null>(null);
  const [miembrosGrupo, setMiembrosGrupo] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      const response = await fetch(getApiUrl(`/personas/${afiliadoModificado.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(afiliadoModificado),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error al actualizar el afiliado: ${response.status} - ${errorText}`);
      }

      // Actualizar el estado local
      setAfiliadoMostrado(afiliadoModificado);
      if (afiliadoModificado.id === afiliado?.id) {
        setAfiliado(afiliadoModificado);
      }

      // Salir del modo de edición
      const nuevosParams = new URLSearchParams(searchParams);
      nuevosParams.delete('modo');
      setSearchParams(nuevosParams);

      modalUniversal.mostrarExito(
        "Cambios guardados",
        "Los cambios se guardaron exitosamente en el sistema."
      );
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

  if (loading) {
    return (
      <div className="admin-page">
        <Header title="Panel de Administración" subtitle="Afiliado - Información personal y estado" />
        <div className="admin-content">
          <HeaderAfiliado onVolver={handleVolver} />
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
        <HeaderAfiliado 
          onVolver={handleVolver} 
          mostrarBotonIntegrante={
            (((afiliadoMostrado as any)?.tipoPersona === "AFILIADO") || (afiliadoMostrado?.parentesco === "Titular")) 
            && !modoEdicion
          }
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

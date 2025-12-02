import React, { useState, useEffect } from "react";
import Button from "../genericos/Button";
import Input from "../genericos/Input";
import Select from "../genericos/Select";
import ModalConfirmacion from "../genericos/ModalConfirmacion";
import Modal from "../genericos/Modal";
import GrupoFamiliarAccordion from "./GrupoFamiliarAccordion";
import CardDireccionesAfiliados from "./CardDireccionesAfiliados";
import SituacionesTerapeuticasInput from "./SituacionesTerapeuticasInput";
import { AlertTriangle, UserX, UserPlus, Plus, Trash2, Edit2, PenOff } from "lucide-react";
import { useModal } from "../../hooks/useModal";
import { personasService } from "../../services/personasService";
import { esPersonaActiva, type PersonaEstado } from "../../utils/estadoAfiliado";
import "./ListaAfiliados.css"
import type { Persona as Afiliado, GrupoFamiliar, Direccion } from "../../types/afiliados";

// Tipo local para direcciones creadas en el modal (no requieren id hasta que el backend las genere)
type NewDireccion = {
  calle: string;
  numero: string;
  depto?: string;
  localidad: string;
  codigoPostal?: string;
}

interface AfiliadoFormProps {
  afiliado: Afiliado | null;
  afiliadoTitular?: Afiliado | null; // Titular original para referencia del grupo
  grupoFamiliar: GrupoFamiliar | null;
  miembrosGrupo: Afiliado[];
  onDarDeBaja: () => void;
  modoEdicion?: boolean; // Nuevo prop para controlar si está en modo edición
  onGuardarCambios?: (afiliadoModificado: Afiliado) => void; // Callback para guardar cambios
  onCancelarEdicion?: () => void; // Callback para cancelar edición
  onActivarEdicion?: () => void; // Callback para activar modo edición
  onIntegranteCreado?: (nuevoIntegrante: any) => void; // Callback para manejar integrante creado
  externalOpenAgregarIntegrante?: boolean;
  onExternalOpenHandled?: () => void;
}

const AfiliadosForm: React.FC<AfiliadoFormProps> = ({ 
  afiliado, 
  afiliadoTitular, 
  grupoFamiliar, 
  miembrosGrupo, 
  onDarDeBaja,
  modoEdicion = false,
  onGuardarCambios,
  onCancelarEdicion,
  onActivarEdicion,
  onIntegranteCreado,
  externalOpenAgregarIntegrante,
  onExternalOpenHandled
}) => {
    const [mostrarModalBaja, setMostrarModalBaja] = useState(false);
    const [mostrarModalAgregarIntegrante, setMostrarModalAgregarIntegrante] = useState(false);
    const [situacionesTerapeuticas, setSituacionesTerapeuticas] = useState<Array<{diagnostico: string, fechaInicio: string, fechaFin: string}>>([]);
    const [direcciones, setDirecciones] = useState<Direccion[]>(afiliado?.direccion || []);
  const [modalEmails, setModalEmails] = useState<string[]>(['']);
  const [modalTelefonos, setModalTelefonos] = useState<string[]>(['']);
  const [modalDirecciones, setModalDirecciones] = useState<NewDireccion[]>([
    { calle: '', numero: '', localidad: '', codigoPostal: '', depto: '' }
  ]);
  const [usarDireccionTitular, setUsarDireccionTitular] = useState<boolean>(false);
    const [modalFechaAlta, setModalFechaAlta] = useState<string>(new Date().toISOString().split('T')[0]);
    // Lista de diagnósticos (actualmente hardcodeada en frontend)
    const [listaSituacionesTerapeuticas] = useState([
      'Anemia', 
      'Ansiedad', 
      'Asma', 
      'Conjuntivitis', 
      'Diabetes', 
      'Esguince', 
      'Estrés', 
      'Fractura', 
      'Gastroenteritis', 
      'Gripe', 
      'Migraña', 
      'Neumonía', 
      'Otitis', 
    ]);
    
    // Hook para el modal
    const modal = useModal();
    
    // Estados para manejar los datos editables del afiliado
    const [datosEditables, setDatosEditables] = useState({
        nombre: afiliado?.nombre || '',
        apellido: afiliado?.apellido || '',
        emails: (Array.isArray(afiliado?.email) ? afiliado.email : (afiliado?.email ? [afiliado.email] : [''])) as string[],
        telefonos: (Array.isArray(afiliado?.telefono) ? afiliado.telefono : (afiliado?.telefono ? [afiliado.telefono] : [''])) as string[],
        fechaNacimiento: afiliado?.fechaNacimiento || '',
        tipoDocumento: afiliado?.tipoDocumento || '',
        numeroDocumento: afiliado?.numeroDocumento || '',
        planMedico: afiliado?.planMedico || '',
        fechaBaja: afiliado?.fechaBaja || '',
        direccion: {
            calle: afiliado?.direccion?.[0]?.calle || '',
            numero: afiliado?.direccion?.[0]?.numero || '',
            localidad: afiliado?.direccion?.[0]?.localidad || '',
            codigoPostal: afiliado?.direccion?.[0]?.codigoPostal || '',
            depto: afiliado?.direccion?.[0]?.depto || ''
        }
    });
    
    // Actualizar datos editables cuando cambie el afiliado
    useEffect(() => {
        if (afiliado) {
            setDatosEditables({
                nombre: afiliado.nombre || '',
                apellido: afiliado.apellido || '',
                emails: (Array.isArray(afiliado.email) ? afiliado.email : (afiliado.email ? [afiliado.email] : [''])) as string[],
                telefonos: (Array.isArray(afiliado.telefono) ? afiliado.telefono : (afiliado.telefono ? [afiliado.telefono] : [''])) as string[],
                fechaNacimiento: afiliado.fechaNacimiento || '',
                tipoDocumento: afiliado.tipoDocumento || '',
                numeroDocumento: afiliado.numeroDocumento || '',
                planMedico: afiliado.planMedico || '',
                fechaBaja: afiliado.fechaBaja || '',
                direccion: {
                    calle: afiliado.direccion?.[0]?.calle || '',
                    numero: afiliado.direccion?.[0]?.numero || '',
                    localidad: afiliado.direccion?.[0]?.localidad || '',
                    codigoPostal: afiliado.direccion?.[0]?.codigoPostal || '',
                    depto: afiliado.direccion?.[0]?.depto || ''
                }
            });
            setDirecciones(afiliado.direccion || []);
        }
    }, [afiliado]);

    // Escuchar evento personalizado del header
    useEffect(() => {
        const handleAbrirModal = () => {
      // Abrir el modal si estamos viendo al titular OR si se pasó `afiliadoTitular` (estamos viendo un integrante)
      if (esTitular() || afiliadoTitular) {
        // inicializar valores del modal antes de abrir
        setModalEmails(['']);
        setModalTelefonos(['']);
        setModalDirecciones([{ calle: '', numero: '', localidad: '', codigoPostal: '', depto: '' }]);
        setSituacionesTerapeuticas([{ diagnostico: '', fechaInicio: '', fechaFin: '' }]);
        setModalFechaAlta(new Date().toISOString().split('T')[0]);
        setUsarDireccionTitular(false);
        setMostrarModalAgregarIntegrante(true);
      }
        };

        window.addEventListener('abrirModalAgregarIntegrante', handleAbrirModal);
        return () => {
            window.removeEventListener('abrirModalAgregarIntegrante', handleAbrirModal);
        };
    }, []);

    // Si el padre solicita abrir el modal mediante la prop externa, abrirlo aquí
    useEffect(() => {
      if (externalOpenAgregarIntegrante) {
        // Abrir si el usuario actual es titular, o si estamos viendo un integrante pero tenemos al titular en props
        if (esTitular() || afiliadoTitular) {
          handleAbrirModalAgregarIntegrante();
        }
        onExternalOpenHandled?.();
      }
    }, [externalOpenAgregarIntegrante]);

  // Usar función utilitaria estandarizada
  const isActive = () => {
    // Evitar pasar null a esPersonaActiva; si no hay afiliado considerarlo inactivo
    if (!afiliado) return false;
    return esPersonaActiva(afiliado as PersonaEstado);
  };

    const esTitular = () => {
        // El backend usa tipoPersona para distinguir: AFILIADO = titular, INTEGRANTE = integrante
        if (afiliado && 'tipoPersona' in afiliado) {
            return (afiliado as any).tipoPersona === "AFILIADO";
        }
        
        // Fallback para compatibilidad con datos del frontend: comprobar la existencia de la clave antes de acceder
        if (afiliado && 'parentesco' in afiliado && (afiliado as any).parentesco) {
            return (afiliado as any).parentesco === "Titular";
        }
        
        // Verificar usando el afiliadoTitular si está disponible
        if (afiliadoTitular && afiliado) {
            // Comparar ids utilizando 'any' para evitar errores de tipado cuando las definiciones pueden variar en los datos
            return (afiliadoTitular as any).id === (afiliado as any).id;
        }
        
        // Si hay miembros del grupo, buscar el titular
        if (miembrosGrupo && miembrosGrupo.length > 0) {
            const titular = miembrosGrupo.find(m => 
                (m as any).parentesco === "Titular" || 
                (m as any).tipoPersona === "AFILIADO"
            );
            // Asegurar que titular y afiliado existan y comparar ids usando 'any' para evitar errores de tipado
            if (titular && afiliado) {
                return (titular as any).id === (afiliado as any).id;
            }
            return false;
        }
        
        // Fallback: si no hay grupo familiar definido, asumir que es titular
        return true;
    };

    const getFieldClassName = (isReadOnly = false) => {
        if (isReadOnly) return 'no-editable';
        return modoEdicion ? 'modo-edicion' : 'modo-visualizacion';
    };

  const renderFieldWithIcon = (content: React.ReactNode, isReadOnly = false) => {
    // Mostrar icono solo si el campo es readonly y además estamos EN modo edición
    if (isReadOnly && modoEdicion) {
      return (
        <div className="field-with-icon">
          {content}
          <div className="field-readonly-icon" title="Campo no editable">
            <PenOff size={16} />
          </div>
        </div>
      );
    }
    return content;
  };

    const handleAbrirModalBaja = () => {
        setMostrarModalBaja(true);
    };

    const handleCerrarModal = () => {
        setMostrarModalBaja(false);
    };

    const handleConfirmarBaja = () => {
        setMostrarModalBaja(false);
        onDarDeBaja();
    };

    const handleAbrirModalAgregarIntegrante = () => {
    // Inicializar estados del modal
    setModalEmails(['']);
    setModalTelefonos(['']);
    setModalDirecciones([{ calle: '', numero: '', localidad: '', codigoPostal: '', depto: '' }]);
    setSituacionesTerapeuticas([{ diagnostico: '', fechaInicio: '', fechaFin: '' }]);
      setModalFechaAlta(new Date().toISOString().split('T')[0]);
      setUsarDireccionTitular(false);
      setMostrarModalAgregarIntegrante(true);
    };

  const handleToggleDireccionTitular = (checked: boolean) => {
    setUsarDireccionTitular(checked);
    
    if (checked) {
      // Copiar direcciones del titular
      const titular = afiliadoTitular || afiliado;
      if (titular?.direccion && titular.direccion.length > 0) {
        const direccionesTitular = titular.direccion.map(d => ({
          calle: d.calle || '',
          numero: d.numero || '',
          localidad: d.localidad || '',
          codigoPostal: d.codigoPostal || '',
          depto: d.depto || ''
        }));
        setModalDirecciones(direccionesTitular);
      }
    } else {
      // Resetear a una dirección vacía
      setModalDirecciones([{ calle: '', numero: '', localidad: '', codigoPostal: '', depto: '' }]);
    }
  };

  const handleModalDireccionChange = (idx: number, field: keyof NewDireccion, value: string) => {
    setModalDirecciones(prev => prev.map((x, i) => i === idx ? { ...x, [field]: value } : x));
    // Si el usuario edita manualmente, desmarcar el checkbox
    if (usarDireccionTitular) {
      setUsarDireccionTitular(false);
    }
  };

  const handleCerrarModalAgregarIntegrante = () => {
    // Confirmar si hay datos en el formulario (revisar estados del modal)
    const tieneContenidoEnModal = (
      modalEmails.some(e => e.trim() !== '') ||
      modalTelefonos.some(t => t.trim() !== '') ||
      modalDirecciones.some(d => d.calle.trim() !== '' || d.numero.trim() !== '' || d.localidad.trim() !== '') ||
      situacionesTerapeuticas.some(st => st.diagnostico.trim() !== '' || st.fechaInicio.trim() !== '')
    );

    if (tieneContenidoEnModal) {
      const confirmarCierre = confirm(
        '¿Está seguro que desea cerrar el formulario?\n\n' +
        'Se perderán todos los datos ingresados.'
      );
      if (!confirmarCierre) return;
    }

    setMostrarModalAgregarIntegrante(false);
    setSituacionesTerapeuticas([{ diagnostico: '', fechaInicio: '', fechaFin: '' }]); // Resetear a uno vacío
    setModalEmails(['']);
    setModalTelefonos(['']);
    setModalDirecciones([{ calle: '', numero: '', localidad: '', codigoPostal: '', depto: '' }]);
    setModalFechaAlta(new Date().toISOString().split('T')[0]);
    setUsarDireccionTitular(false);
  };

    const validarFormularioIntegrante = (): { esValido: boolean; errores: string[] } => {
        const errores: string[] = [];

        // Obtener valores directamente de los inputs
        const getInputValue = (name: string): string => {
            const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement;
            return input?.value || '';
        };

        // Validar campos obligatorios básicos
        if (!getInputValue('parentesco')) errores.push('Parentesco es obligatorio');
        if (!getInputValue('nombre')) errores.push('Nombre es obligatorio');
        if (!getInputValue('apellido')) errores.push('Apellido es obligatorio');
        if (!getInputValue('tipoDocumento')) errores.push('Tipo de documento es obligatorio');
        if (!getInputValue('numeroDocumento')) errores.push('Número de documento es obligatorio');
        if (!getInputValue('fechaNacimiento')) errores.push('Fecha de nacimiento es obligatoria');

        // Validar al menos una dirección válida
        const direccionesValidas = modalDirecciones.filter(d => (d.calle || '').trim() !== '' || (d.numero || '').trim() !== '' || (d.localidad || '').trim() !== '');
        if (direccionesValidas.length === 0) {
          errores.push('Debe ingresar al menos una dirección válida');
        } else {
          const dir = direccionesValidas[0];
          if (!(dir.calle || '').trim()) errores.push('Calle es obligatoria');
          if (!(dir.numero || '').trim()) errores.push('Número de dirección es obligatorio');
          if (!String(dir.codigoPostal || '').trim()) errores.push('Código postal es obligatorio');
          if (!(dir.localidad || '').trim()) errores.push('Localidad es obligatoria');
        }

        if (!modalFechaAlta) errores.push('Fecha de alta es obligatoria');

        // Validar fechas del sistema
        const fechaAlta = modalFechaAlta;
        const fechaNacimiento = getInputValue('fechaNacimiento');

        if (fechaNacimiento && fechaAlta && fechaNacimiento > fechaAlta) {
            errores.push('Fecha de alta no puede ser anterior a la fecha de nacimiento');
        }

        // Validar situaciones terapéuticas
        situacionesTerapeuticas.forEach((situacion, index) => {
          const dx = situacion.diagnostico ? situacion.diagnostico.trim() : '';
          const fi = situacion.fechaInicio ? situacion.fechaInicio.trim() : '';
          const ff = situacion.fechaFin ? situacion.fechaFin.trim() : '';

          if (!dx && !fi && !ff) return;

          if (dx && !fi) {
            errores.push(`Fecha de inicio de la situación ${index + 1} es obligatoria`);
          }

          if (ff && fi && ff < fi) {
            errores.push(`Fecha de fin no puede ser anterior a fecha de inicio en situación ${index + 1}`);
          }
        });

        return { esValido: errores.length === 0, errores };
    };

    const handleConfirmarAgregarIntegrante = async () => {
        const validacion = validarFormularioIntegrante();
        
        if (!validacion.esValido) {
            modal.mostrarError(
                'Faltan campos requeridos',
                'Por favor complete todos los campos obligatorios marcados con * y corrija los errores de validación.',
                validacion.errores
            );
            return;
        }

        // Función helper para obtener valores de inputs
        const getInputValue = (name: string): string => {
            const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement;
            return input?.value || '';
        };
        
      // Determinar titular real (si se pasó por props) y crear contenido extra con los datos del integrante
      const titular = afiliadoTitular || afiliado;

      const datosIntegrante = (
        <div className="datos-confirmacion">
          <div style={{ marginBottom: 8 }}>
            <strong>Titular:</strong>
            <div>{titular ? `${titular.nombre} ${titular.apellido}` : 'Titular no disponible'}</div>
            {titular?.credencial && (
            <div style={{ fontSize: 12, color: '#666' }}>{`Credencial titular: ${titular.credencial}${titular.sufijo ? '-' + titular.sufijo : ''}`}</div>
            )}
          </div>

          <div style={{ marginBottom: 8 }}>
            <strong>Nuevo integrante:</strong>
            <div>{`${getInputValue('nombre')} ${getInputValue('apellido')}`}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{`Documento: ${getInputValue('tipoDocumento')} ${getInputValue('numeroDocumento')}`}</div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <strong>Fecha de alta:</strong>
            <div>{modalFechaAlta || '—'}</div>
          </div>

          {/* El backend asigna credencial y sufijo automáticamente; no mostrar ni calcular desde frontend */}
        </div>
      );

        // Mostrar modal de confirmación usando el modal universal
    modal.mostrarModal({
      titulo: 'Confirmar Agregado de Integrante',
      mensaje: `¿Confirma que desea agregar este integrante al grupo familiar del titular ${titular ? `${titular.nombre} ${titular.apellido}` : ''}?`,
            tipo: 'confirmation',
            textoBotonConfirmar: 'Confirmar y Agregar',
            textoBotonCancelar: 'Cancelar',
            icono: <UserPlus size={20} />,
            contenidoExtra: datosIntegrante,
            onConfirmar: () => handleConfirmarCreacionIntegrante()
        });
    };

    const handleConfirmarCreacionIntegrante = async () => {

        // Función helper para obtener valores de inputs
        const getInputValue = (name: string): string => {
            const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement;
            return input?.value || '';
        };

  // Crear el integrante en el backend
        try {

      const integranteData = {
        nombre: getInputValue('nombre'),
        apellido: getInputValue('apellido'),
        tipoDocumento: getInputValue('tipoDocumento'),
        numeroDocumento: getInputValue('numeroDocumento'),
        fechaNacimiento: getInputValue('fechaNacimiento'),
        telefono: modalTelefonos.filter(t => t.trim() !== ''),
        email: modalEmails.filter(e => e.trim() !== ''),
        parentesco: getInputValue('parentesco') || 'Integrante',
  // Use controlled modalFechaAlta to ensure the selected date is sent
  fechaAlta: modalFechaAlta,
        fechaBaja: getInputValue('fechaBaja') || null,
        direccion: modalDirecciones
          .filter(d => (d.calle || '').trim() !== '' || (d.numero || '').trim() !== '' || (d.localidad || '').trim() !== '')
          .map(d => ({ calle: d.calle || '', numero: d.numero || '', localidad: d.localidad || '', codigoPostal: String(d.codigoPostal || '') })),
            situacionesTerapeuticas: situacionesTerapeuticas
              // Considerar una situación como cargada sólo si se completó el diagnóstico.
              .filter(st => st.diagnostico.trim() !== '')
              .map(st => ({ ...st, fechaFin: (st.fechaFin || '').trim() === '' ? null : st.fechaFin })),
            // No enviar 'sufijo' desde el frontend: el backend asigna credencial y sufijo automáticamente
      };

      const titularCredencial = afiliadoTitular?.credencial || afiliado?.credencial;
      if (!titularCredencial) {
        throw new Error('Credencial del titular no disponible');
      }

  console.log('Payload crear integrante:', JSON.stringify(integranteData, null, 2));
  const nuevoIntegrante = await personasService.createIntegrante(titularCredencial, integranteData);
        console.log('Integrante creado exitosamente:', nuevoIntegrante);

        if (onIntegranteCreado) {
          onIntegranteCreado(nuevoIntegrante);
        }
        } catch (error) {
            console.error('Error al crear el integrante:', error);
            modal.mostrarError(
                'Error al crear integrante',
                'No se pudo crear el integrante: ' + (error as Error).message
            );
            return;
        }
        
        setMostrarModalAgregarIntegrante(false);
        setSituacionesTerapeuticas([{ diagnostico: '', fechaInicio: '', fechaFin: '' }]); // Resetear a uno vacío
        setModalEmails(['']);
        setModalTelefonos(['']);
        setModalDirecciones([{ calle: '', numero: '', localidad: '', codigoPostal: '', depto: '' }]);
        setUsarDireccionTitular(false);
    };



    // Funciones para manejar emails
    const agregarEmail = () => {
        setDatosEditables(prev => ({
            ...prev,
            emails: [...prev.emails, '']
        }));
    };

    const eliminarEmail = (index: number) => {
        // No permitir eliminar si solo hay un email y no está vacío
        const emailsNoVacios = datosEditables.emails.filter(email => email.trim() !== '');
        if (emailsNoVacios.length === 1 && datosEditables.emails[index].trim() !== '') {
            modal.mostrarAdvertencia(
                'No se puede eliminar',
                'Debe mantener al menos una dirección de email.'
            );
            return;
        }

        setDatosEditables(prev => ({
            ...prev,
            emails: prev.emails.filter((_, i) => i !== index)
        }));
    };

    const actualizarEmail = (index: number, valor: string) => {
        setDatosEditables(prev => ({
            ...prev,
            emails: prev.emails.map((email, i) => i === index ? valor : email)
        }));
    };

    // Función para manejar cambios en las direcciones
    const handleDireccionesChange = (nuevasDirecciones: Direccion[]) => {
        setDirecciones(nuevasDirecciones);
    };

    // Funciones para manejar teléfonos
    const agregarTelefono = () => {
        setDatosEditables(prev => ({
            ...prev,
            telefonos: [...prev.telefonos, '']
        }));
    };

    const eliminarTelefono = (index: number) => {
        // No permitir eliminar si solo hay un teléfono y no está vacío
        const telefonosNoVacios = datosEditables.telefonos.filter(telefono => telefono.trim() !== '');
        if (telefonosNoVacios.length === 1 && datosEditables.telefonos[index].trim() !== '') {
            modal.mostrarAdvertencia(
                'No se puede eliminar',
                'Debe mantener al menos un número de teléfono.'
            );
            return;
        }

        setDatosEditables(prev => ({
            ...prev,
            telefonos: prev.telefonos.filter((_, i) => i !== index)
        }));
    };

    const actualizarTelefono = (index: number, valor: string) => {
        setDatosEditables(prev => ({
            ...prev,
            telefonos: prev.telefonos.map((telefono, i) => i === index ? valor : telefono)
        }));
    };

    const agregarSituacionTerapeutica = () => {
        setSituacionesTerapeuticas([...situacionesTerapeuticas, { diagnostico: '', fechaInicio: '', fechaFin: '' }]);
    };

    const eliminarSituacionTerapeutica = (index: number) => {
        const nuevasSituaciones = situacionesTerapeuticas.filter((_, i) => i !== index);
        setSituacionesTerapeuticas(nuevasSituaciones);
    };

    const actualizarSituacionTerapeutica = (index: number, campo: 'diagnostico' | 'fechaInicio' | 'fechaFin', valor: string) => {
        const nuevasSituaciones = [...situacionesTerapeuticas];
        nuevasSituaciones[index][campo] = valor;
        setSituacionesTerapeuticas(nuevasSituaciones);
    };

    // Funciones para el modo de edición
    const handleCampoChange = (campo: string, valor: string) => {
        if (campo.startsWith('direccion.')) {
            const campoDireccion = campo.split('.')[1];
            setDatosEditables(prev => ({
                ...prev,
                direccion: {
                    ...prev.direccion,
                    [campoDireccion]: valor
                }
            }));
        } else {
            setDatosEditables(prev => ({
                ...prev,
                [campo]: valor
            }));
        }
    };

    const validarCamposEditables = (): { esValido: boolean; errores: string[] } => {
        const errores: string[] = [];
        
        if (!datosEditables.nombre.trim()) errores.push('El nombre es obligatorio');
        if (!datosEditables.apellido.trim()) errores.push('El apellido es obligatorio');
        if (!datosEditables.tipoDocumento.trim()) errores.push('El tipo de documento es obligatorio');
        if (!datosEditables.numeroDocumento.trim()) errores.push('El número de documento es obligatorio');
        if (!datosEditables.fechaNacimiento.trim()) errores.push('La fecha de nacimiento es obligatoria');
        
        // Validar que haya al menos un teléfono válido
        const telefonosValidos = datosEditables.telefonos.filter(tel => tel.trim() !== '');
        if (telefonosValidos.length === 0) {
            errores.push('Debe tener al menos un número de teléfono');
        }

        // Validar que haya al menos un email válido
        const emailsValidos = datosEditables.emails.filter(email => email.trim() !== '');
        if (emailsValidos.length === 0) {
            errores.push('Debe tener al menos una dirección de email');
        }

        // Validar formato de emails válidos
        datosEditables.emails.forEach((email, index) => {
            if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                errores.push(`El formato del email ${index + 1} no es válido`);
            }
        });
        
        // Validar fecha de nacimiento no sea futura
        const fechaNac = new Date(datosEditables.fechaNacimiento);
        const hoy = new Date();
        if (fechaNac > hoy) {
            errores.push('La fecha de nacimiento no puede ser futura');
        }
        
        return { esValido: errores.length === 0, errores };
    };

    const handleGuardarCambios = () => {
        const validacion = validarCamposEditables();
        
        if (!validacion.esValido) {
            modal.mostrarError(
                'Errores en el formulario',
                'Por favor corrige los siguientes errores:',
                validacion.errores
            );
            return;
        }

        if (onGuardarCambios && afiliado) {
            const afiliadoModificado: Afiliado = {
                ...afiliado,
                nombre: datosEditables.nombre,
                apellido: datosEditables.apellido,
                email: datosEditables.emails.filter(email => email.trim() !== ''),
                telefono: datosEditables.telefonos.filter(telefono => telefono.trim() !== ''),
                fechaNacimiento: datosEditables.fechaNacimiento,
                tipoDocumento: datosEditables.tipoDocumento,
                numeroDocumento: datosEditables.numeroDocumento,
                planMedico: datosEditables.planMedico,
                fechaBaja: datosEditables.fechaBaja || null,
                direccion: direcciones
            };
            
            onGuardarCambios(afiliadoModificado);
        }
    };

    const handleCancelarEdicion = () => {
        // Restaurar datos originales
        if (afiliado) {
            setDatosEditables({
                nombre: afiliado.nombre || '',
                apellido: afiliado.apellido || '',
                emails: Array.isArray(afiliado.email) ? afiliado.email : (afiliado.email ? [afiliado.email] : ['']),
                telefonos: Array.isArray(afiliado.telefono) ? afiliado.telefono : (afiliado.telefono ? [afiliado.telefono] : ['']),
                fechaNacimiento: afiliado.fechaNacimiento || '',
                tipoDocumento: afiliado.tipoDocumento || '',
                numeroDocumento: afiliado.numeroDocumento || '',
                planMedico: afiliado.planMedico || '',
                fechaBaja: afiliado.fechaBaja || '',
                direccion: {
                    calle: afiliado.direccion?.[0]?.calle || '',
                    numero: afiliado.direccion?.[0]?.numero || '',
                    localidad: afiliado.direccion?.[0]?.localidad || '',
                    codigoPostal: afiliado.direccion?.[0]?.codigoPostal || '',
                    depto: afiliado.direccion?.[0]?.depto || ''
                }
            });
        }
        
        if (onCancelarEdicion) {
            onCancelarEdicion();
        }
    };

    const getModalContent = () => {
        const titular = esTitular();
        const cantidadIntegrantes = miembrosGrupo ? miembrosGrupo.length - 1 : 0; // -1 para excluir al titular
        
        if (titular && cantidadIntegrantes > 0) {
            return {
                titulo: "Dar de baja Afiliado",
                mensaje: `¿Está seguro que desea dar de baja a ${afiliado?.nombre} ${afiliado?.apellido}?`,
                submensaje: `Al ser el titular del grupo familiar, esta acción dará de baja automáticamente a todos los integrantes del grupo familiar. Esta acción no se puede deshacer.`,
                icono: <AlertTriangle size={24} />,
                tipoOperacion: 'danger' as const
            };
        } else if (titular && cantidadIntegrantes === 0) {
            return {
                titulo: "Dar de baja Afiliado",
                mensaje: `¿Está seguro que desea dar de baja a ${afiliado?.nombre} ${afiliado?.apellido}?`,
                submensaje: "Esta acción marcará al afiliado como inactivo en el sistema. Esta acción no se puede deshacer.",
                icono: <UserX size={24} />,
                tipoOperacion: 'warning' as const
            };
        } else {
            return {
                titulo: "Dar de baja al Integrante",
                mensaje: `¿Estás seguro que deseas dar de baja a ${afiliado?.nombre} ${afiliado?.apellido}?`,
                submensaje: "Esta acción dará de baja únicamente a este integrante del grupo familiar. El titular y otros integrantes permanecerán activos.",
                icono: <UserX size={24} />,
                tipoOperacion: 'warning' as const
            };
        }
    };


  // Use the real titular (passed via props) when showing modal info; fallback to current afiliado
  const titularParaModal = afiliadoTitular || afiliado;

  return (
    <>
          <div className={`afiliado-form ${modoEdicion ? 'modo-edicion' : ''}`}>
            {/* Campos no editables */}
            <div className={`form-row ${getFieldClassName(true)}`}>
                <label>Credencial</label>
                {renderFieldWithIcon(<span>{afiliado?.credencial}-{afiliado?.sufijo}</span>, true)}
            </div> 
            <div className={`form-row ${getFieldClassName(true)}`}>
                <label>Parentesco</label>
                {renderFieldWithIcon(
                    <span className={esTitular() ? 'titular' : 'integrante'}>
                        {esTitular() ? 'Titular' : (afiliado?.parentesco || 'Integrante')}
                    </span>, 
                    true
                )}
            </div>

            {/* Plan Médico - Editable solo para titulares */}
            {modoEdicion ? (
              esTitular() ? (
                <div className={`form-row ${getFieldClassName()}`}>
                  <label>Plan Médico *</label>
                  <Select
                    value={datosEditables.planMedico}
                    onChange={(value) => handleCampoChange('planMedico', value)}
                    options={[
                      { value: "Bronce", label: "Bronce" },
                      { value: "Plata", label: "Plata" },
                      { value: "Oro", label: "Oro" },
                      { value: "Platino", label: "Platino" }
                    ]}
                    placeholder="Seleccionar plan médico"
                  />
                </div>
              ) : (
                <div className={`form-row ${getFieldClassName(true)}`}>
                  <label>Plan Médico</label>
                  {renderFieldWithIcon(<span>{afiliado?.planMedico}</span>, true)}
                </div>
              )
            ) : (
              <div className={`form-row ${getFieldClassName(true)}`}>
                <label>Plan Médico</label>
                {renderFieldWithIcon(<span>{afiliado?.planMedico}</span>, true)}
              </div>
            )}
            
            {/* Campos editables según el modo */}
            {modoEdicion ? (
              <>
                {/* Modo Edición */}
                <div className={`form-row ${getFieldClassName()}`}>
                  <label>Nombre *</label>
                  <Input 
                    type="text" 
                    value={datosEditables.nombre}
                    onChange={(value) => handleCampoChange('nombre', value)}
                    required
                  />
                </div>
                <div className={`form-row ${getFieldClassName()}`}>
                  <label>Apellido *</label>
                  <Input 
                    type="text" 
                    value={datosEditables.apellido}
                    onChange={(value) => handleCampoChange('apellido', value)}
                    required
                  />
                </div>

                <div className="form-row-double">
                  <div className={`form-row-double-item-left ${getFieldClassName()}`}> 
                    <label>Tipo de documento *</label>
                    <Select 
                      value={datosEditables.tipoDocumento}
                      onChange={(value) => handleCampoChange('tipoDocumento', value)}
                      options={[
                        { value: "", label: "Seleccionar..." },
                        { value: "DNI", label: "DNI" },
                        { value: "LC", label: "LC" },
                        { value: "LE", label: "LE" },
                        { value: "PASAPORTE", label: "Pasaporte" }
                      ]}
                      placeholder="Seleccionar tipo de documento"
                    />
                  </div>
                  <div className={`form-row-double-item-right ${getFieldClassName()}`}>
                    <label>Número de documento *</label>
                    <Input 
                      type="text" 
                      value={datosEditables.numeroDocumento}
                      onChange={(value) => handleCampoChange('numeroDocumento', value)}
                      required
                    />
                  </div>
                </div>
                
                <div className={`form-row ${getFieldClassName()}`}>
                  <label>Fecha de nacimiento *</label>
                  <Input 
                    type="date" 
                    value={datosEditables.fechaNacimiento}
                    onChange={(value) => handleCampoChange('fechaNacimiento', value)}
                    required
                  />
                </div>


              <div>
                <div className="form-row-double">
                    <div className={`form-row-double-item-left ${getFieldClassName()}`}>
                      <label>Teléfono</label>
                      <div className="contactos-editables">
                        {datosEditables.telefonos.map((telefono, index) => (
                          <div key={index} className="contacto-editable">
                            <Input 
                              type="text" 
                              value={telefono}
                              onChange={(value) => actualizarTelefono(index, value)}
                              placeholder="Ingrese teléfono"
                            />
                            {(datosEditables.telefonos.length > 1 || telefono.trim() === '') && (
                              <Button 
                                variant="danger" 
                                size="small" 
                                icon={Trash2}
                                onClick={() => eliminarTelefono(index)}
                                className="btn-eliminar-contacto"
                              />
                            )}
                          </div>
                        ))}
                        <Button 
                          variant="primary" 
                          size="small" 
                          icon={Plus}
                          onClick={agregarTelefono}
                        >
                          Agregar Teléfono
                        </Button>
                      </div>
                    </div>

                    {/* Contacto editable - Emails */}
                    <div className={`form-row-double-item-right ${getFieldClassName()}`}>
                      <label>Email</label>
                      <div className="contactos-editables">
                        {datosEditables.emails.map((email, index) => (
                          <div key={index} className="contacto-editable">
                            <Input 
                              type="email" 
                              value={email}
                              onChange={(value) => actualizarEmail(index, value)}
                              placeholder="Ingrese email"
                            />
                            {(datosEditables.emails.length > 1 || email.trim() === '') && (
                              <Button 
                                variant="danger" 
                                size="small" 
                                icon={Trash2}
                                onClick={() => eliminarEmail(index)}
                                className="btn-eliminar-contacto"
                              />
                            )}
                          </div>
                        ))}
                        <Button 
                          variant="primary" 
                          size="small" 
                          icon={Plus}
                          onClick={agregarEmail}
                        >
                          Agregar Email
                        </Button>
                      </div>
                    </div>
                </div>
              </div>  
                              {/* Direcciones dinámicas */}
                <CardDireccionesAfiliados
                  direcciones={direcciones}
                  personaId={afiliado?.id || 0}
                  modoEdicion={modoEdicion}
                  onDireccionesChange={handleDireccionesChange}
                />

              </>
            ) : (
              <>
                {/* Modo Visualización */}
                <div className={`form-row ${getFieldClassName()}`}><label>Nombre</label><span>{afiliado?.nombre}</span></div>
                <div className={`form-row ${getFieldClassName()}`}><label>Apellido</label><span>{afiliado?.apellido}</span></div>

                <div className="form-row-double">
                  <div className={`form-row-double-item-left ${getFieldClassName()}`}> 
                    <label>Tipo de documento</label><span>{afiliado?.tipoDocumento}</span>
                  </div>
                  <div className={`form-row-double-item-right ${getFieldClassName()}`}>
                    <label>Número de documento</label><span>{afiliado?.numeroDocumento}</span>
                  </div>
                </div>
                <div className={`form-row ${getFieldClassName()}`}>
                  <label>Fecha de nacimiento</label>
                  <span>{afiliado?.fechaNacimiento}</span>
                </div>
                {/* Datos de Contacto - Visualización alineada */}
                <div className="form-row-double">
                  <div className={`form-row-double-item-left ${getFieldClassName()}`}>
                    <label>Teléfono</label>
                    {afiliado?.telefono.map((tel: string, index: number) => <span key={index}>{tel}</span> )}
                  </div>
                  <div className={`form-row-double-item-right ${getFieldClassName()}`}>
                    <label>Email</label>
                    {afiliado?.email.map((e: string, index: number) => <span key={index}>{`${e}`}</span>)}
                  </div>
                </div>
                
                <CardDireccionesAfiliados
                  direcciones={afiliado?.direccion || []}
                  personaId={afiliado?.id || 0}
                  modoEdicion={modoEdicion}
                  onDireccionesChange={handleDireccionesChange}
                />
                
              </>
            )}
          <div className={`form-row ${getFieldClassName(true)}`}>
            <h4>Situaciones Terapeuticas</h4>
            

              {afiliado && afiliado.situacionesTerapeuticas && afiliado.situacionesTerapeuticas.length > 0
                ? afiliado.situacionesTerapeuticas.map((st: any, index: number) => st.fechaFin === null ?
                  <div key={index}>
                    <div className="form-row-double">
                      <div className={`form-row-double-item-left ${getFieldClassName(true)}`}>
                      <label>Diagnóstico</label> 
                      {renderFieldWithIcon(<span>{st.diagnostico}</span>, true)}
                    </div>
                    <div className={`form-row-double-item-right ${getFieldClassName(true)}`}>
                      <label>Fecha de inicio</label> 
                      {renderFieldWithIcon(<span>{st.fechaInicio}</span>, true)}
                    </div>
                  </div>
                 
                  </div> : 
                  <div key={index}>
                    <div className={`form-row ${getFieldClassName(true)}`}>
                      <label>Diagnóstico</label> 
                      {renderFieldWithIcon(<span>{st.diagnostico}</span>, true)}
                    </div>
                  <div className="form-row-double">

                    <div className={`form-row-double-item-left ${getFieldClassName(true)}`}>
                      <label>Fecha de inicio</label> 
                      {renderFieldWithIcon(<span>{st.fechaInicio}</span>, true)}
                    </div>
                    <div className={`form-row-double-item-right ${getFieldClassName(true)}`}>
                      <label>Fecha de fin</label> 
                      {renderFieldWithIcon(<span>{st.fechaFin}</span>, true)}
                    </div>
                  </div>
                </div>
              )
                : (
                    <>
                      <label>Diagnóstico</label>
                      {renderFieldWithIcon(<span>No posee situaciones terapeuticas</span>, true)}
                    </>
                  )
          }
          </div>

          <div className={`form-row ${getFieldClassName(true)}`}>
            <h4>Ingreso/Egreso al Sistema</h4>
            <div className="form-row-double">
              <div className={`form-row-double-item-left ${getFieldClassName(true)}`}>
                <label>Fecha de Alta</label>
                {renderFieldWithIcon(<span>{afiliado?.fechaAlta}</span>, true)}
              </div>
              <div className={`form-row-double-item-right ${getFieldClassName(modoEdicion)}`}>
                <label>Fecha Baja</label>
                {modoEdicion ? (
                  <Input 
                    type="date" 
                    value={datosEditables.fechaBaja}
                    onChange={(value: string) => setDatosEditables({...datosEditables, fechaBaja: value})}
                    placeholder="Dejar vacío si está activo"
                  />
                ) : (
                  renderFieldWithIcon(<span>{afiliado?.fechaBaja ?? 'No posee fecha de baja'}</span>, true)
                )}
                {modoEdicion && <small className="form-help">Dejar vacío para reactivar o completar para programar baja</small>}
              </div>
            </div>
        
          </div>

          {afiliado && grupoFamiliar && miembrosGrupo.length > 0 && (
            <GrupoFamiliarAccordion
              afiliadoActual={afiliado}
              grupoFamiliar={grupoFamiliar}
              miembrosGrupo={miembrosGrupo}
              onAgregarIntegrante={handleAbrirModalAgregarIntegrante}
            />
          )}
          <div className="form-row"></div>

          <div className="botones-acciones">
            {modoEdicion ? (
              <>
                <Button size="large" variant="cancel" type="button" onClick={handleCancelarEdicion}>
                  Cancelar Edición
                </Button>
                <Button size="large" variant="primary" type="button" onClick={handleGuardarCambios}>
                  Guardar Cambios
                </Button>
              </>
            ) : (
              <>
                {/* Solo mostrar botones si el afiliado está activo */}
                {isActive() && (
                  <>
                    <Button 
                      size="large" 
                      variant="primary" 
                      type="button" 
                      onClick={onActivarEdicion}
                      disabled={!onActivarEdicion}
                    >
                      <Edit2 size={16} style={{marginRight: '8px'}} />
                      Editar
                    </Button>
                    <Button size="large" variant="danger" type="button" onClick={handleAbrirModalBaja}>
                      Dar de baja
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
          </div>

          {/* Modal de confirmación para dar de baja */}
          <ModalConfirmacion
            isOpen={mostrarModalBaja}
            onClose={handleCerrarModal}
            onConfirm={handleConfirmarBaja}
            titulo={getModalContent().titulo}
            mensaje={getModalContent().mensaje}
            submensaje={getModalContent().submensaje}
            tipoOperacion={getModalContent().tipoOperacion}
            icono={getModalContent().icono}
            textoBotonConfirmar="Sí, dar de baja"
            textoBotonCancelar="Cancelar"
          />

          {/* Modal para agregar integrante */}
          {mostrarModalAgregarIntegrante && (
            <div className="modal-overlay" onClick={handleCerrarModalAgregarIntegrante}>
              <div className="modal-content modal-agregar-integrante" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3><UserPlus size={20} /> Agregar Integrante al Grupo Familiar</h3>
                  <p>Completar los datos del nuevo integrante para el grupo familiar del titular <strong>{titularParaModal ? `${titularParaModal.nombre} ${titularParaModal.apellido}` : ''}</strong></p>
                </div>
                
                <div className="modal-form">
                  {/* Sección: Datos Básicos */}
                  <div className="form-section">
                    <h4 className="section-title">Datos Básicos</h4>
                    
                    <div className="form-row-double">
                      <div className="form-row-double-item-left">
                        <label>Titular</label>
                          <div className="credencial-info">
                            {titularParaModal ? `${titularParaModal.nombre} ${titularParaModal.apellido}` : ''}
                          </div>
                          {titularParaModal?.credencial && (
                            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{`Credencial: ${titularParaModal.credencial}${titularParaModal.sufijo ? '-' + titularParaModal.sufijo : ''}`}</div>
                          )}
                      </div>
                      <div className="form-row-double-item-right">
                        <label>Parentesco *</label>
                        <Select 
                          name="parentesco" 
                          placeholder="Seleccionar parentesco"
                          options={[
                            { value: "Cónyuge", label: "Cónyuge" },
                            { value: "Hijo/a", label: "Hijo/a" },
                            { value: "Padre", label: "Padre" },
                            { value: "Madre", label: "Madre" },
                            { value: "Hermano/a", label: "Hermano/a" },
                            { value: "Otros", label: "Otros" }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="form-row-double">
                      <div className="form-row-double-item-left">
                        <label>Nombre *</label>
                        <Input
                          type="text"
                          name="nombre"
                          required
                          validationType="nombre"
                          showValidation={true}
                        />
                      </div>
                      <div className="form-row-double-item-right">
                        <label>Apellido *</label>
                        <Input
                          type="text"
                          name="apellido"
                          required
                          validationType="apellido"
                          showValidation={true}
                        />
                      </div>
                    </div>

                    <div className="form-row-triple">
                      <div className="form-row-triple-item">
                        <label>Tipo de documento *</label>
                        <Select 
                          name="tipoDocumento" 
                          placeholder="Seleccionar tipo"
                          options={[
                            { value: "DNI", label: "DNI" },
                            { value: "CI", label: "CI" },
                            { value: "Pasaporte", label: "Pasaporte" }
                          ]}
                        />
                      </div>
                      <div className="form-row-triple-item">
                        <label>Número de documento *</label>
                        <Input
                          type="text"
                          name="numeroDocumento"
                          required
                          placeholder="12345678"
                          validationType="dni"
                          showValidation={true}
                        />
                      </div>
                      <div className="form-row-triple-item">
                        <label>Fecha de nacimiento *</label>
                        <Input type="date" name="fechaNacimiento" required />
                      </div>
                    </div>
                  </div>

                  {/* Sección: Contacto */}
                  <div className="form-section">
                    <h4 className="section-title">Información de Contacto</h4>
                    
                    <div className="form-row-double">
                      <div className="form-row-double-item-left">
                        <label>Email(s)</label>
                        <div className="contactos-dinamicos">
                          {modalEmails.map((email, idx) => (
                            <div key={idx} className="contacto-dinamico-row">
                              <Input
                                type="email"
                                value={email}
                                onChange={(v: string) => {
                                  setModalEmails(prev => prev.map((e,i)=> i===idx? v : e));
                                }}
                                placeholder="ejemplo@email.com"
                                validationType="email"
                                showValidation={true}
                              />
                              <div>
                                {modalEmails.length > 1 && (
                                  <Button size="small" variant="danger" icon={Trash2} onClick={() => setModalEmails(prev => prev.filter((_,i)=>i!==idx))} />
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="agregar-contacto-wrap">
                            <Button size="small" variant="primary" icon={Plus} onClick={() => setModalEmails(prev => [...prev, ''])}>Agregar Email</Button>
                          </div>
                        </div>
                      </div>
                      <div className="form-row-double-item-right">
                        <label>Teléfono(s)</label>
                        <div className="contactos-dinamicos">
                          {modalTelefonos.map((tel, idx) => (
                            <div key={idx} className="contacto-dinamico-row">
                              <Input
                                type="tel"
                                value={tel}
                                onChange={(v: string) => setModalTelefonos(prev => prev.map((t,i)=> i===idx? v : t))}
                                placeholder="1112345678"
                                validationType="telefono"
                                showValidation={true}
                              />
                              <div>
                                {modalTelefonos.length > 1 && (
                                  <Button size="small" variant="danger" icon={Trash2} onClick={() => setModalTelefonos(prev => prev.filter((_,i)=>i!==idx))} />
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="agregar-contacto-wrap">
                            <Button size="small" variant="primary" icon={Plus} onClick={() => setModalTelefonos(prev => [...prev, ''])}>Agregar Teléfono</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección: Dirección */}
                  <div className="form-section">
                    <h4 className="section-title">Dirección de Residencia</h4>
                    
                    {/* Checkbox para usar dirección del titular */}
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e1e4e8' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={usarDireccionTitular}
                          onChange={(e) => handleToggleDireccionTitular(e.target.checked)}
                          style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        <span>Usar misma dirección que el titular</span>
                      </label>
                      <small style={{ display: 'block', marginLeft: '24px', marginTop: '4px', color: '#606060', fontSize: '12px' }}>
                        Puede agregar direcciones adicionales después
                      </small>
                    </div>
                    
                    <div className="direcciones-dinamicas">
                      {modalDirecciones.map((d, idx) => (
                        <div key={idx} className="direccion-item">
                          <div className="form-row-double">
                            <div className="form-row-double-item-left">
                              <label>Calle *</label>
                              <Input
                                type="text"
                                name={`calle-${idx}`}
                                value={d.calle}
                                onChange={(v: string) => handleModalDireccionChange(idx, 'calle', v)}
                                placeholder="Av. Corrientes"
                                required
                                validationType="requerido"
                                showValidation={true}
                              />
                            </div>
                            <div className="form-row-double-item-right">
                              <label>Número *</label>
                              <Input
                                type="text"
                                name={`numero-${idx}`}
                                value={d.numero}
                                onChange={(v: string) => handleModalDireccionChange(idx, 'numero', v)}
                                placeholder="1234"
                                required
                                validationType="altura"
                                showValidation={true}
                              />
                            </div>
                          </div>

                          <div className="form-row-triple">
                            <div className="form-row-triple-item">
                              <label>Departamento</label>
                              <Input type="text" name={`depto-${idx}`} value={d.depto ?? ''} onChange={(v: string) => handleModalDireccionChange(idx, 'depto', v)} placeholder="1A" />
                            </div>
                            <div className="form-row-triple-item">
                              <label>Código Postal *</label>
                              <Input
                                type="text"
                                name={`codigoPostal-${idx}`}
                                value={d.codigoPostal ?? ''}
                                onChange={(v: string) => handleModalDireccionChange(idx, 'codigoPostal', v)}
                                placeholder="1043"
                                required
                                validationType="codigoPostal"
                                showValidation={true}
                              />
                            </div>
                            <div className="form-row-triple-item">
                              <label>Localidad *</label>
                              <Input
                                type="text"
                                name={`localidad-${idx}`}
                                value={d.localidad}
                                onChange={(v: string) => handleModalDireccionChange(idx, 'localidad', v)}
                                placeholder="CABA"
                                required
                                validationType="requerido"
                                showValidation={true}
                              />
                            </div>
                          </div>

                          <div className="direccion-actions">
                            {modalDirecciones.length > 1 && (
                              <Button size="small" variant="danger" icon={Trash2} onClick={() => setModalDirecciones(prev => prev.filter((_,i)=>i!==idx))}>Eliminar Dirección</Button>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="agregar-direccion-action">
                        <Button size="small" variant="primary" icon={Plus} onClick={() => setModalDirecciones(prev => [...prev, { calle: '', numero: '', localidad: '', codigoPostal: '', depto: '' }])}>Agregar Dirección</Button>
                      </div>
                    </div>
                  </div>

                  {/* Sección: Información del Sistema */}
                  <div className="form-section">
                    <h4 className="section-title">Información del Sistema</h4>
                    <div className="section-description">
                      <p>Fechas administrativas para control interno del sistema</p>
                    </div>
                    
                    <div className="form-row-double">
                      <div className="form-row-double-item-left">
                        <label>Fecha de Alta del Sistema *</label>
                        <Input
                          type="date"
                          name="fechaAlta"
                          required
                          value={modalFechaAlta}
                          onChange={(v: string) => setModalFechaAlta(v)}
                        />
                        <small className="form-help">Fecha en que se registra en el sistema</small>
                      </div>
                      <div className="form-row-double-item-right">
                        <label>Fecha de Baja del Sistema</label>
                        <Input 
                          type="date" 
                          name="fechaBaja" 
                          placeholder="Dejar vacío si está activo"
                        />
                        <small className="form-help">Solo completar si se da de baja</small>
                      </div>
                    </div>

                    <div className="form-note">
                      <small>
                        La fecha de alta se propone con la fecha de hoy, pero puede modificarse si necesita una alta diferida.
                      </small>
                    </div>
                  </div>

                  {/* Sección: Situaciones Terapéuticas */}
                  <div className="form-section">
                    <div className="section-header-with-button">
                      <h4 className="section-title">Situaciones Terapéuticas</h4>
                      <button 
                        type="button"
                        className="btn-agregar-situacion"
                        onClick={agregarSituacionTerapeutica}
                      >
                        <Plus size={16} />
                        Agregar Situación
                      </button>
                    </div>

                    {situacionesTerapeuticas.length === 0 ? (
                      <div className="form-note">
                        <small>
                          No hay situaciones terapéuticas agregadas. 
                          Haz clic en "Agregar Situación" para añadir una nueva.
                        </small>
                      </div>
                    ) : (
                      <div className="situaciones-lista">
                        {situacionesTerapeuticas.map((situacion, index) => (
                          <div key={index} className="situacion-item">
                            <div className="situacion-header">
                              <span className="situacion-numero">Situación {index + 1}</span>
                              <button
                                type="button"
                                className="btn-eliminar-situacion"
                                onClick={() => eliminarSituacionTerapeutica(index)}
                                title="Eliminar situación terapéutica"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            
                            <div className="form-row">
                              <label>Diagnóstico</label>
                              <SituacionesTerapeuticasInput
                                value={situacion}
                                onChange={(field, value) => actualizarSituacionTerapeutica(index, field as any, value)}
                                listaSituacionesTerapeuticas={listaSituacionesTerapeuticas}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="form-note">
                      <small>
                        Importante: Las situaciones terapéuticas solo se pueden agregar al momento del alta. 
                        Asegúrate de incluir todas las situaciones necesarias antes de confirmar.
                      </small>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <div className="campos-requeridos-info">
                    <small>* Campos obligatorios</small>
                  </div>
                  <div className="modal-buttons">
                    <Button variant="cancel" onClick={handleCerrarModalAgregarIntegrante}>
                      Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleConfirmarAgregarIntegrante}>
                      Agregar Integrante
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}





          {/* Modal */}
          <Modal
            isOpen={modal.isOpen}
            onClose={modal.cerrarModal}
            onConfirm={modal.confirmarModal}
            titulo={modal.config?.titulo || ''}
            mensaje={modal.config?.mensaje || ''}
            submensaje={modal.config?.submensaje}
            tipo={modal.config?.tipo || 'info'}
            textoBotonConfirmar={modal.config?.textoBotonConfirmar}
            textoBotonCancelar={modal.config?.textoBotonCancelar}
            icono={modal.config?.icono}
            contenidoExtra={modal.config?.contenidoExtra}
            soloInformacion={modal.config?.soloInformacion}
            listaErrores={modal.config?.listaErrores}
          />
        </>
    );
};

export default AfiliadosForm;

import React, { useState, useEffect } from "react";
import Button from "../genericos/Button";
import Input from "../genericos/Input";
import Select from "../genericos/Select";
import ModalConfirmacion from "../genericos/ModalConfirmacion";
import Modal from "../genericos/Modal";
import GrupoFamiliarAccordion from "./GrupoFamiliarAccordion";
import CardDireccionesAfiliados from "./CardDireccionesAfiliados";
import { AlertTriangle, UserX, UserPlus, Plus, Trash2, Edit2, PenOff } from "lucide-react";
import { useModal } from "../../hooks/useModal";
import { personasService } from "../../services/personasService";
import { calcularProximoSufijo } from "../../utils/calcularSufijo";
import "./ListaAfiliados.css"
import type { Afiliado, GrupoFamiliar, Direccion } from "../../types/afiliados";

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
    onIntegranteCreado
}) => {
    const [mostrarModalBaja, setMostrarModalBaja] = useState(false);
    const [mostrarModalAgregarIntegrante, setMostrarModalAgregarIntegrante] = useState(false);
    const [situacionesTerapeuticas, setSituacionesTerapeuticas] = useState<Array<{diagnostico: string, fechaInicio: string, fechaFin: string}>>([]);
    const [direcciones, setDirecciones] = useState<Direccion[]>(afiliado?.direccion || []);
  // Estados específicos del modal de Agregar Integrante para múltiples contactos/direcciones
  const [modalEmails, setModalEmails] = useState<string[]>(['']);
  const [modalTelefonos, setModalTelefonos] = useState<string[]>(['']);
  const [modalDirecciones, setModalDirecciones] = useState<NewDireccion[]>([
    { calle: '', numero: '', localidad: '', codigoPostal: '', depto: '' }
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
      if (esTitular()) {
        // inicializar valores del modal antes de abrir
        setModalEmails(['']);
        setModalTelefonos(['']);
                setModalDirecciones([{ calle: '', numero: '', localidad: '', codigoPostal: '', depto: '' }]);
        setSituacionesTerapeuticas([{ diagnostico: '', fechaInicio: '', fechaFin: '' }]);
        setMostrarModalAgregarIntegrante(true);
      }
        };

        window.addEventListener('abrirModalAgregarIntegrante', handleAbrirModal);
        return () => {
            window.removeEventListener('abrirModalAgregarIntegrante', handleAbrirModal);
        };
    }, []);

    const isActive = () => {
        if (!afiliado?.fechaBaja) return true;
        const today = new Date().toISOString().split('T')[0];
        return afiliado.fechaBaja > today;
    };

    const esTitular = () => {
        // El backend usa tipoPersona para distinguir: AFILIADO = titular, INTEGRANTE = integrante
        if (afiliado && 'tipoPersona' in afiliado) {
            return (afiliado as any).tipoPersona === "AFILIADO";
        }
        
        // Fallback para compatibilidad con datos del frontend
        if (afiliado?.parentesco) {
            return afiliado.parentesco === "Titular";
        }
        
        // Verificar usando el afiliadoTitular si está disponible
        if (afiliadoTitular && afiliado) {
            return afiliadoTitular.id === afiliado.id;
        }
        
        // Si hay miembros del grupo, buscar el titular
        if (miembrosGrupo && miembrosGrupo.length > 0) {
            const titular = miembrosGrupo.find(m => 
                m.parentesco === "Titular" || 
                (m as any).tipoPersona === "AFILIADO"
            );
            return titular ? titular.id === afiliado?.id : false;
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
    setMostrarModalAgregarIntegrante(true);
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
    // Validar al menos una dirección válida (desde modalDirecciones)
    const direccionesValidas = modalDirecciones.filter(d => (d.calle || '').trim() !== '' || (d.numero || '').trim() !== '' || (d.localidad || '').trim() !== '');
    if (direccionesValidas.length === 0) {
      errores.push('Debe ingresar al menos una dirección con calle, número y localidad');
    } else {
      const dir = direccionesValidas[0];
      if (!(dir.calle || '').trim()) errores.push('Calle es obligatoria');
      if (!(dir.numero || '').trim()) errores.push('Número de dirección es obligatorio');
      if (!String(dir.codigoPostal || '').trim()) errores.push('Código postal es obligatorio');
      if (!(dir.localidad || '').trim()) errores.push('Localidad es obligatoria');
    }
        if (!getInputValue('fechaAlta')) errores.push('Fecha de alta es obligatoria');
        
        // Validar fechas del sistema
        const fechaAlta = getInputValue('fechaAlta');
        const fechaBaja = getInputValue('fechaBaja');
        const fechaNacimiento = getInputValue('fechaNacimiento');
        
        if (fechaNacimiento && fechaAlta && fechaNacimiento > fechaAlta) {
            errores.push('Fecha de alta no puede ser anterior a la fecha de nacimiento');
        }
        
        if (fechaBaja && fechaAlta && fechaBaja < fechaAlta) {
            errores.push('Fecha de baja no puede ser anterior a la fecha de alta');
        }

        // Validar situaciones terapéuticas (si existen, deben estar completas)
        situacionesTerapeuticas.forEach((situacion, index) => {
            if (!situacion.diagnostico.trim()) {
                errores.push(`Diagnóstico de la situación ${index + 1} es obligatorio`);
            }
            if (!situacion.fechaInicio.trim()) {
                errores.push(`Fecha de inicio de la situación ${index + 1} es obligatoria`);
            }
            // Validar que fecha fin no sea anterior a fecha inicio
            if (situacion.fechaFin && situacion.fechaInicio && situacion.fechaFin < situacion.fechaInicio) {
                errores.push(`Fecha de fin no puede ser anterior a fecha de inicio en situación ${index + 1}`);
            }
      // Permitimos que la fecha de inicio de una situación terapéutica sea anterior a la fecha de alta
      // (caso de condiciones preexistentes). No se agrega validación adicional aquí.
        });
        
        return { esValido: errores.length === 0, errores };
    };

    const handleConfirmarAgregarIntegrante = async () => {
        const validacion = validarFormularioIntegrante();
        
        if (!validacion.esValido) {
            modal.mostrarError(
                'Errores en el formulario',
                'Por favor corrige los siguientes errores:',
                validacion.errores
            );
            return;
        }

        // Función helper para obtener valores de inputs
        const getInputValue = (name: string): string => {
            const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement;
            return input?.value || '';
        };
        
        // Obtener datos del formulario para la confirmación
        const nombre = getInputValue('nombre');
        const apellido = getInputValue('apellido');
        const numeroDocumento = getInputValue('numeroDocumento');
        const fechaAlta = getInputValue('fechaAlta');
        
        // Calcular el próximo sufijo para mostrarlo en la confirmación
        const proximoSufijo = calcularProximoSufijo(miembrosGrupo);
        
        // Crear contenido extra con los datos del integrante
        const datosIntegrante = (
            <div className="datos-confirmacion">
                <h4>DATOS DEL NUEVO INTEGRANTE:</h4>
                <div className="dato-confirmacion">
                    <strong>• Nombre:</strong> {nombre} {apellido}
                </div>
                <div className="dato-confirmacion">
                    <strong>• DNI:</strong> {numeroDocumento}
                </div>
                <div className="dato-confirmacion">
                    <strong>• Credencial:</strong> {afiliado?.credencial}-{proximoSufijo}
                </div>
                <div className="dato-confirmacion">
                    <strong>• Fecha de Alta:</strong> {fechaAlta}
                </div>
                <div className="dato-confirmacion">
                    <strong>• Situaciones Terapéuticas:</strong> {situacionesTerapeuticas.length}
                </div>
                <div className="advertencia-confirmacion">
                    <AlertTriangle size={16} />
                    <p>Esta acción agregará permanentemente al integrante al grupo familiar.</p>
                </div>
            </div>
        );

        // Mostrar modal de confirmación usando el modal universal
        modal.mostrarModal({
            titulo: 'Confirmar Agregado de Integrante',
            mensaje: `¿Confirma que desea agregar este integrante al grupo familiar de ${afiliado?.nombre} ${afiliado?.apellido}?`,
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
            // Calcular el próximo sufijo disponible
            const proximoSufijo = calcularProximoSufijo(miembrosGrupo);
            console.log('Próximo sufijo calculado para el nuevo integrante:', proximoSufijo);
            console.log('Miembros actuales del grupo:', miembrosGrupo.map(m => ({id: m.id, sufijo: m.sufijo, nombre: m.nombre})));

      const integranteData = {
        nombre: getInputValue('nombre'),
        apellido: getInputValue('apellido'),
        tipoDocumento: getInputValue('tipoDocumento'),
        numeroDocumento: getInputValue('numeroDocumento'),
        fechaNacimiento: getInputValue('fechaNacimiento'),
        telefono: modalTelefonos.filter(t => t.trim() !== ''),
        email: modalEmails.filter(e => e.trim() !== ''),
        parentesco: getInputValue('parentesco') || 'Integrante',
        fechaAlta: getInputValue('fechaAlta'),
        fechaBaja: getInputValue('fechaBaja') || null,
        sufijo: proximoSufijo,
        direccion: modalDirecciones
          .filter(d => (d.calle || '').trim() !== '' || (d.numero || '').trim() !== '' || (d.localidad || '').trim() !== '')
          .map(d => ({ calle: d.calle || '', numero: d.numero || '', localidad: d.localidad || '', codigoPostal: String(d.codigoPostal || ''), depto: d.depto && d.depto.trim() !== '' ? d.depto : null })),
        situacionesTerapeuticas: situacionesTerapeuticas.filter(st => 
          st.diagnostico.trim() !== '' || st.fechaInicio.trim() !== ''
        )
      };

            const idTitular = afiliadoTitular?.id || afiliado?.id;
            if (!idTitular) {
                throw new Error('ID del titular no disponible');
            }

            const nuevoIntegrante = await personasService.createIntegrante(idTitular, integranteData);
            console.log('Integrante creado exitosamente:', nuevoIntegrante);
            
            const titular = afiliadoTitular || afiliado;
            modal.mostrarExito(
                '¡Integrante agregado exitosamente!',
                `Se agregó un nuevo integrante al grupo familiar de ${titular?.nombre} ${titular?.apellido}.`,
                'La página se actualizará automáticamente para mostrar los cambios.'
            );

            // Llamar al callback para manejar la navegación
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

    const getEstadoText = () => {
        if (!afiliado?.fechaBaja) return 'Activo';
        const today = new Date().toISOString().split('T')[0];
        if (afiliado.fechaBaja > today) {
            return `Activo hasta ${afiliado.fechaBaja}`;
        }
        return 'Inactivo';
    };

    return (
        <>
          <div className="afiliado-header">
            <div className="afiliado-info">
              {!esTitular() && afiliadoTitular && (
                <p className="grupo-familiar-info">
                  Integrante del grupo familiar de <strong>{afiliadoTitular.nombre} {afiliadoTitular.apellido}</strong>
                </p>
              )}
              {esTitular() && (
                <p className="grupo-familiar-info">
                  Titular del grupo familiar de <strong>{afiliado?.nombre} {afiliado?.apellido}</strong>
                </p>
              )}
              <h2>{afiliado?.nombre} {afiliado?.apellido}</h2>
              <span className={`estado-badge ${isActive() ? 'activo' : 'inactivo'}`}>
                {getEstadoText()}
              </span>
            </div>
          </div>

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

                {/* Direcciones dinámicas */}
                <CardDireccionesAfiliados
                  direcciones={direcciones}
                  personaId={afiliado?.id || 0}
                  modoEdicion={modoEdicion}
                  onDireccionesChange={handleDireccionesChange}
                />

              <div>
                <h4>Datos de contacto</h4>

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

                <CardDireccionesAfiliados
                  direcciones={afiliado?.direccion || []}
                  personaId={afiliado?.id || 0}
                  modoEdicion={modoEdicion}
                  onDireccionesChange={handleDireccionesChange}
                />
                
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
              <div className={`form-row-double-item-right ${getFieldClassName(true)}`}>
                <label>Fecha Baja</label>
                {renderFieldWithIcon(<span>{afiliado.fechaBaja ? afiliado.fechaBaja : 'No posee fecha de baja'}</span>, true)}
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
                  <p>Completar los datos del nuevo integrante para el grupo familiar de <strong>{afiliado?.nombre} {afiliado?.apellido}</strong></p>
                </div>
                
                <div className="modal-form">
                  {/* Sección: Datos Básicos */}
                  <div className="form-section">
                    <h4 className="section-title">Datos Básicos</h4>
                    
                    <div className="form-row-double">
                      <div className="form-row-double-item-left">
                        <label>Credencial del Titular</label>
                        <div className="credencial-info">
                          {afiliado?.credencial}-{afiliado?.sufijo}
                        </div>
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
                        <Input type="text" name="nombre" required />
                      </div>
                      <div className="form-row-double-item-right">
                        <label>Apellido *</label>
                        <Input type="text" name="apellido" required />
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
                        <Input type="text" name="numeroDocumento" required placeholder="12345678" />
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
                              <Input type="email" value={email} onChange={(v: string) => {
                                setModalEmails(prev => prev.map((e,i)=> i===idx? v : e));
                              }} placeholder="ejemplo@email.com" />
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
                              <Input type="tel" value={tel} onChange={(v: string) => setModalTelefonos(prev => prev.map((t,i)=> i===idx? v : t))} placeholder="11-1234-5678" />
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
                    
                    <div className="direcciones-dinamicas">
                      {modalDirecciones.map((d, idx) => (
                        <div key={idx} className="direccion-item">
                          <div className="form-row-double">
                            <div className="form-row-double-item-left">
                              <label>Calle *</label>
                              <Input type="text" value={d.calle} onChange={(v: string) => setModalDirecciones(prev => prev.map((x,i)=> i===idx? {...x, calle: v} : x))} placeholder="Av. Corrientes" />
                            </div>
                            <div className="form-row-double-item-right">
                              <label>Número *</label>
                              <Input type="text" value={d.numero} onChange={(v: string) => setModalDirecciones(prev => prev.map((x,i)=> i===idx? {...x, numero: v} : x))} placeholder="1234" />
                            </div>
                          </div>

                          <div className="form-row-triple">
                            <div className="form-row-triple-item">
                              <label>Departamento</label>
                              <Input type="text" value={d.depto ?? ''} onChange={(v: string) => setModalDirecciones(prev => prev.map((x,i)=> i===idx? {...x, depto: v} : x))} placeholder="1A" />
                            </div>
                            <div className="form-row-triple-item">
                              <label>Código Postal *</label>
                              <Input type="text" value={d.codigoPostal ?? ''} onChange={(v: string) => setModalDirecciones(prev => prev.map((x,i)=> i===idx? {...x, codigoPostal: v} : x))} placeholder="1043" />
                            </div>
                            <div className="form-row-triple-item">
                              <label>Localidad *</label>
                              <Input type="text" value={d.localidad} onChange={(v: string) => setModalDirecciones(prev => prev.map((x,i)=> i===idx? {...x, localidad: v} : x))} placeholder="CABA" />
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
                          value={new Date().toISOString().split('T')[0]}
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
                        La fecha de alta se establece automáticamente a la fecha de hoy. 
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
                              <label>Diagnóstico *</label>
                              <Input 
                                type="text" 
                                value={situacion.diagnostico}
                                onChange={(value) => actualizarSituacionTerapeutica(index, 'diagnostico', value)}
                                placeholder="Descripción del diagnóstico"
                                required
                              />
                            </div>
                            
                            <div className="form-row-double">
                              <div className="form-row-double-item-left">
                                <label>Fecha de Inicio *</label>
                                <Input 
                                  type="date" 
                                  value={situacion.fechaInicio}
                                  onChange={(value) => actualizarSituacionTerapeutica(index, 'fechaInicio', value)}
                                  required
                                />
                              </div>
                              <div className="form-row-double-item-right">
                                <label>Fecha de Fin (opcional)</label>
                                <Input 
                                  type="date" 
                                  value={situacion.fechaFin}
                                  onChange={(value) => actualizarSituacionTerapeutica(index, 'fechaFin', value)}
                                  placeholder="Dejar vacío si está activa"
                                />
                              </div>
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

import { useState } from 'react';
import type { TipoModal } from '../components/genericos/Modal';

interface ConfigModal {
  titulo: string;
  mensaje: string;
  submensaje?: string;
  tipo: TipoModal;
  textoBotonConfirmar?: string;
  textoBotonCancelar?: string;
  icono?: React.ReactNode;
  contenidoExtra?: React.ReactNode;
  soloInformacion?: boolean;
  listaErrores?: string[];
  onConfirmar?: () => void;
}

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfigModal | null>(null);

  const mostrarModal = (configuracion: ConfigModal) => {
    setConfig(configuracion);
    setIsOpen(true);
  };

  const cerrarModal = () => {
    setIsOpen(false);
    setConfig(null);
  };

  const confirmarModal = () => {
    if (config?.onConfirmar) {
      config.onConfirmar();
    }
    cerrarModal();
  };

  // Funciones de conveniencia para diferentes tipos de modales
  const mostrarExito = (titulo: string, mensaje: string, submensaje?: string) => {
    mostrarModal({
      titulo,
      mensaje,
      submensaje,
      tipo: 'success',
      soloInformacion: true,
      textoBotonConfirmar: 'Aceptar'
    });
  };

  const mostrarError = (titulo: string, mensaje: string, listaErrores?: string[]) => {
    mostrarModal({
      titulo,
      mensaje,
      tipo: 'error',
      soloInformacion: true,
      textoBotonConfirmar: 'Aceptar',
      listaErrores
    });
  };

  const mostrarAdvertencia = (titulo: string, mensaje: string, submensaje?: string) => {
    mostrarModal({
      titulo,
      mensaje,
      submensaje,
      tipo: 'warning',
      soloInformacion: true,
      textoBotonConfirmar: 'Entendido'
    });
  };

  const mostrarConfirmacion = (
    titulo: string, 
    mensaje: string, 
    onConfirmar: () => void,
    submensaje?: string,
    tipo: TipoModal = 'confirmation'
  ) => {
    mostrarModal({
      titulo,
      mensaje,
      submensaje,
      tipo,
      textoBotonConfirmar: 'Confirmar',
      textoBotonCancelar: 'Cancelar',
      onConfirmar
    });
  };

  const mostrarConfirmacionPeligrosa = (
    titulo: string, 
    mensaje: string, 
    onConfirmar: () => void,
    submensaje?: string
  ) => {
    mostrarModal({
      titulo,
      mensaje,
      submensaje,
      tipo: 'danger',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
      onConfirmar
    });
  };

  return {
    isOpen,
    config,
    mostrarModal,
    cerrarModal,
    confirmarModal,
    mostrarExito,
    mostrarError,
    mostrarAdvertencia,
    mostrarConfirmacion,
    mostrarConfirmacionPeligrosa
  };
};
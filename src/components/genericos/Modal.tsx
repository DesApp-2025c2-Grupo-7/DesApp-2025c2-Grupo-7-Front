import React from 'react';
import Button from './Button';
import './Modal.css';

export type TipoModal = 'success' | 'error' | 'warning' | 'info' | 'confirmation' | 'danger';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  titulo: string;
  mensaje: string;
  submensaje?: string;
  tipo: TipoModal;
  textoBotonConfirmar?: string;
  textoBotonCancelar?: string;
  icono?: React.ReactNode;
  // Para casos especiales como mostrar datos
  contenidoExtra?: React.ReactNode;
  // Para modals de solo información (sin botón de cancelar)
  soloInformacion?: boolean;
  // Lista de errores para validaciones
  listaErrores?: string[];
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  submensaje,
  tipo,
  textoBotonConfirmar = 'Aceptar',
  textoBotonCancelar = 'Cancelar',
  icono,
  contenidoExtra,
  soloInformacion = false,
  listaErrores
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIconoDefault = () => {
    if (icono) return icono;
    
    switch (tipo) {
      case 'success':
        return <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>;
      case 'error':
        return <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>;
      case 'warning':
        return <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>;
      case 'info':
        return <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      case 'confirmation':
        return <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      case 'danger':
        return <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className={`modal-universal modal-${tipo}`}>
        <div className={`modal-header header-${tipo}`}>
          <div className="modal-icon">{getIconoDefault()}</div>
          <h3 className="modal-titulo">{titulo}</h3>
        </div>
        
        <div className="modal-body">
          <p className="modal-mensaje">{mensaje}</p>
          
          {submensaje && (
            <div className="modal-submensaje">
              <p>{submensaje}</p>
            </div>
          )}
          
          {listaErrores && listaErrores.length > 0 && (
            <div className="modal-errores">
              <ul>
                {listaErrores.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {contenidoExtra && (
            <div className="modal-contenido-extra">
              {contenidoExtra}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          {!soloInformacion && (
            <Button
              variant="cancel"
              size="medium"
              onClick={onClose}
            >
              {textoBotonCancelar}
            </Button>
          )}
          <Button
            variant={
              tipo === 'danger' ? 'danger' :
              tipo === 'success' ? 'primary' :
              tipo === 'error' ? 'danger' :
              'primary'
            }
            size="medium"
            onClick={onConfirm || onClose}
          >
            {textoBotonConfirmar}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
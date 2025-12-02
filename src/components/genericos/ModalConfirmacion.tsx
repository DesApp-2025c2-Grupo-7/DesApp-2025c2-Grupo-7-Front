import React from 'react';
import Button from './Button';
import './ModalConfirmacion.css';

interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensaje: string;
  submensaje?: string | React.ReactNode;
  tipoOperacion: 'danger' | 'warning' | 'info';
  textoBotonConfirmar?: string;
  textoBotonCancelar?: string;
  icono?: React.ReactNode;
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  submensaje,
  tipoOperacion,
  textoBotonConfirmar = 'Confirmar',
  textoBotonCancelar = 'Cancelar',
  icono
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className={`modal-header ${tipoOperacion}`}>
          {icono && <div className="modal-icon">{icono}</div>}
          <h3 className="modal-titulo">{titulo}</h3>
        </div>
        
        <div className="modal-body">
          <p className="modal-mensaje">{mensaje}</p>
          {submensaje && (
            <div className="modal-submensaje">
              {typeof submensaje === 'string' ? <p>{submensaje}</p> : submensaje}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <Button
            variant="cancel"
            size="medium"
            onClick={onClose}
          >
            {textoBotonCancelar}
          </Button>
          <Button
            variant={tipoOperacion === 'danger' ? 'danger' : 'primary'}
            size="medium"
            onClick={onConfirm}
          >
            {textoBotonConfirmar}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
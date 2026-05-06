import { useEffect, type ReactNode, type MouseEvent } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  large?: boolean;
  header?: ReactNode;
  title?: string;
  shortcut?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function Modal({ open, onClose, large, header, title, shortcut, footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`${styles.overlay} ${large ? styles.fullscreen : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`${styles.modal} ${large ? styles.large : ''}`} role="dialog" aria-modal="true">
        <div className={styles.header}>
          {header ?? (
            <>
              <span className={styles.title}>{title}</span>
              {shortcut && <span className={styles.shortcut}>{shortcut}</span>}
            </>
          )}
        </div>
        <div className={styles.body}>{children}</div>
        <div className={styles.footer}>
          {footer ?? <button className="btn-secondary" onClick={onClose}>Fechar</button>}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return createPortal(<dialog ref={ref} className="modal-shell" aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }}>
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>{children}</div>
  </dialog>, document.body);
}

import { createContext, useContext, useState, useCallback } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((message, title = 'Confirm Action') => {
    return new Promise((resolve) => {
      setState({ message, title, resolve });
    });
  }, []);

  const handle = (result) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={() => handle(false)}>
          <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">⚠</div>
            <div className="confirm-title">{state.title}</div>
            <div className="confirm-msg">{state.message}</div>
            <div className="confirm-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => handle(false)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={() => handle(true)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext).confirm;

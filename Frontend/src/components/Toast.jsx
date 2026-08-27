const Toast = ({ toast }) => {
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className={`hifi-toast ${toast.type === "info" ? "is-info" : ""}`}
      role="alert"
    >
      {toast.message}
    </div>
  );
};

export default Toast;

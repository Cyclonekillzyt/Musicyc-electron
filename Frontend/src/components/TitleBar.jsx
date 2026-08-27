const TitleBar = () => {
  const hasWindowControls =
    typeof window !== "undefined" && window.electronAPI?.windowMinimize;

  return (
    <div className="hifi-titlebar">
      {hasWindowControls && (
        <>
          <button
            type="button"
            className="hifi-window-btn minimize"
            onClick={() => window.electronAPI.windowMinimize()}
            aria-label="Minimize window"
            title="Minimize"
          />
          <button
            type="button"
            className="hifi-window-btn close"
            onClick={() => window.electronAPI.windowClose()}
            aria-label="Close window"
            title="Close"
          />
        </>
      )}
    </div>
  );
};

export default TitleBar;

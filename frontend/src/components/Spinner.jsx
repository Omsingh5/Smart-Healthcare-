const Spinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
    }}
  >
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        border: "2px solid rgba(45,212,191,0.2)",
        borderTopColor: "#2dd4bf",
        animation: "spin 0.7s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default Spinner;

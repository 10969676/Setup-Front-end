import { useState } from "react";
import { enableSetup, disableSetup } from "../api/setupApi";

export default function SetupTable({ data, onRefresh }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleToggle = (uuid, currentlyEnabled) => {
    // Confirmation dialog before disabling
    if (currentlyEnabled) {
      const confirmed = window.confirm("Are you sure you want to disable this setup? This may affect active services.");
      if (!confirmed) return;
    }

    setLoadingId(uuid);
    const action = currentlyEnabled ? disableSetup : enableSetup;

    action(uuid)
      .then(() => onRefresh())
      .catch((err) => alert("Failed to update status: " + err.message))
      .finally(() => setLoadingId(null));
  };

  return (
    <table border="1" width="80%">
      <thead>
        <tr style={{ backgroundColor: "#6a696d" }}>
          <th style={{ padding: "10px" }}>Name</th>
          <th style={{ padding: "10px" }}>Type</th>
          <th style={{ padding: "10px" }}>Description</th>
          <th style={{ padding: "10px", textAlign: "center" }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((s) => (
          <tr key={s.uuid} style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: "10px" }}>{s.name}</td>
            <td style={{ padding: "10px" }}>{s.setupType}</td>
            <td style={{ padding: "10px" }}>{s.description}</td>
            <td style={{ padding: "10px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: s.enabled ? "#2e7d32" : "#757575" }}>
                  {s.enabled ? "Active" : "Inactive"}
                </span>
                <label className="switch" style={switchStyles.container}>
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    disabled={loadingId === s.uuid}
                    onChange={() => handleToggle(s.uuid, s.enabled)}
                    style={{ display: "none" }}
                  />
                  <span style={{
                    ...switchStyles.slider,
                    backgroundColor: s.enabled ? "#4CAF50" : "#ccc",
                    cursor: loadingId === s.uuid ? "not-allowed" : "pointer"
                  }}>
                    <span style={{
                      ...switchStyles.knob,
                      transform: s.enabled ? "translateX(20px)" : "translateX(0)"
                    }} />
                  </span>
                </label>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const switchStyles = {
  container: {
    position: "relative",
    display: "inline-block",
    width: "44px",
    height: "24px",
  },
  slider: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: "34px",
    transition: "0.4s",
  },
  knob: {
    position: "absolute",
    height: "18px",
    width: "18px",
    left: "3px",
    bottom: "3px",
    backgroundColor: "white",
    borderRadius: "50%",
    transition: "0.4s",
  }
};

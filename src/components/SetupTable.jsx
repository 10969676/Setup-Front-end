import { useState, useEffect, useCallback } from "react";
import { enableSetup, disableSetup, edit, getAllTrees, createSetupWithParent } from "../api/setupApi";

export default function SetupTable({ data = [], onRefresh }) {
  const [loadingId, setLoadingId] = useState(null);
  const [editingSetup, setEditingSetup] = useState(null);
  
  const [modalTypes, setModalTypes] = useState([]);
  const [modalParents, setModalParents] = useState([]);

  const [formData, setFormData] = useState({ 
    name: "", 
    setupType: "", 
    description: "", 
    parentName: "" 
  });

  const loadTreeMetadata = useCallback(async () => {
    try {
      const res = await getAllTrees();
      const treeData = res.data || [];
      const typeSet = new Set();
      const flatList = [];

      const traverse = (nodes, level = 0, parentName = "") => {
        nodes.forEach((node) => {
          typeSet.add(node.setupType);
          flatList.push({ 
            ...node,
            level, 
            actualParentName: parentName 
          });
          if (node.children?.length > 0) {
            traverse(node.children, level + 1, node.name);
          }
        });
      };
      traverse(treeData);
      setModalTypes([...typeSet]);
      setModalParents(flatList);
    } catch (err) {
      console.error("Metadata load error:", err);
    }
  }, []);

  useEffect(() => {
    loadTreeMetadata();
  }, [loadTreeMetadata]);

  const handleEditClick = (setup) => {
    const nodeInTree = modalParents.find(p => p.uuid === setup.uuid);
    
    setEditingSetup(setup);
    setFormData({
      name: setup.name || "",
      setupType: setup.setupType || "",
      description: setup.description || "",
      parentName: nodeInTree?.actualParentName || "" 
    });
  };

  const closeModal = () => setEditingSetup(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.setupType?.trim()) {
      alert("Name and Category Type are required.");
      return;
    }

    setLoadingId(editingSetup.uuid);
    try {
      // Logic to handle "moving" the node (effectively soft-deleting from old parent)
      if (formData.parentName) {
        // We pass the uuid within the data object so the backend knows this is an edit/move
        await createSetupWithParent(formData.parentName, {
          ...formData,
          uuid: editingSetup.uuid 
        });
      } else {
        // Update as a Root node
        await edit(editingSetup.uuid, formData);
      }
      
      closeModal();
      await loadTreeMetadata();
      onRefresh();
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggle = (uuid, currentlyEnabled) => {
    if (currentlyEnabled && !window.confirm("Disable this setup?")) return;
    setLoadingId(uuid);
    const action = currentlyEnabled ? disableSetup : enableSetup;
    action(uuid).then(() => onRefresh()).finally(() => setLoadingId(null));
  };

  return (
    <div style={{ position: "relative" }}>
      <table border="1" width="100%" style={{ borderCollapse: "collapse", fontFamily: "Arial", fontSize: "14px" }}>
        <thead>
          <tr style={{ backgroundColor: "#6a696d", color: "white" }}>
            <th style={headerStyle}>Name</th>
            <th style={headerStyle}>Type</th>
            <th style={headerStyle}>Description</th>
            <th style={{ ...headerStyle, textAlign: "center" }}>Status</th>
            <th style={{ ...headerStyle, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((s) => (
            <tr key={s.uuid} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={cellStyle}>{s.name}</td>
              <td style={cellStyle}>{s.setupType}</td>
              <td style={cellStyle}>{s.description}</td>
              <td style={{ ...cellStyle, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: s.enabled ? "#2e7d32" : "#757575" }}>
                    {s.enabled ? "Active" : "Inactive"}
                  </span>
                  <label style={switchStyles.container}>
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
              <td style={{ ...cellStyle, textAlign: "center" }}>
                <button onClick={() => handleEditClick(s)} style={editBtnStyle}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingSetup && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Edit Setup</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Setup Name *</label>
              <input name="name" style={inputStyle} value={formData.name} onChange={handleChange} />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Category Type *</label>
              <select name="setupType" style={inputStyle} value={formData.setupType} onChange={handleChange}>
                <option value="">Select Type</option>
                {modalTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Parent Setup</label>
              <select name="parentName" style={inputStyle} value={formData.parentName} onChange={handleChange}>
                <option value="">No Parent (Root)</option>
                {modalParents
                  .filter(p => p.uuid !== editingSetup.uuid) 
                  .map((p) => (
                  <option key={p.uuid} value={p.name}>
                    {"— ".repeat(p.level)}
                    {`${p.name} (${p.setupType})`}
                  </option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Description *</label>
              <textarea name="description" style={{...inputStyle, height: "60px", resize: "none"}} value={formData.description} onChange={handleChange} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button onClick={closeModal} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleSave} disabled={loadingId === editingSetup.uuid} style={saveBtnStyle}>
                {loadingId === editingSetup.uuid ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const headerStyle = { padding: "12px", textAlign: "left" };
const cellStyle = { padding: "12px" };
const editBtnStyle = { padding: "6px 12px", backgroundColor: "#1976d2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalContentStyle = { background: "white", padding: "25px", borderRadius: "8px", width: "450px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" };
const formGroupStyle = { marginBottom: "15px", display: "flex", flexDirection: "column", gap: "5px" };
const labelStyle = { fontSize: "14px", fontWeight: "bold", color: "#444" };
const inputStyle = { padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px", outline: "none" };
const cancelBtnStyle = { padding: "8px 16px", borderRadius: "4px", border: "none", cursor: "pointer", background: "#f44336", color: "white" };
const saveBtnStyle = { padding: "8px 16px", borderRadius: "4px", border: "none", backgroundColor: "#2e7d32", color: "white", cursor: "pointer" };
const switchStyles = {
  container: { position: "relative", display: "inline-block", width: "44px", height: "24px" },
  slider: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: "34px", transition: "0.4s" },
  knob: { position: "absolute", height: "18px", width: "18px", left: "3px", bottom: "3px", backgroundColor: "white", borderRadius: "50%", transition: "0.4s" }
};

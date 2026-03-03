import { useEffect, useState, useCallback } from "react";
import {
  getAllTrees,
  createSetup,
  createSetupWithParent,
} from "../api/setupApi";

export default function SetupManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("setup"); // 'setup' or 'type'
  const [parents, setParents] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    setupType: "",
    parentName: "",
    description: "",
    enabled: true,
  });
  const [newTypeName, setNewTypeName] = useState("");
  const [errors, setErrors] = useState({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllTrees();
      const data = res.data || [];
      const typeSet = new Set();
      const flatList = [];

      const traverse = (nodes, level = 0) => {
        nodes.forEach((node) => {
          typeSet.add(node.setupType);
          flatList.push({ name: node.name, setupType: node.setupType, level });
          if (node.children?.length > 0) traverse(node.children, level + 1);
        });
      };
      traverse(data);
      setTypes([...typeSet]);
      setParents(flatList);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name required";
    if (!formData.description.trim())
      newErrors.description = "Description required";
    if (!formData.setupType.trim()) newErrors.setupType = "Type required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      if (formData.parentName) {
        await createSetupWithParent(formData.parentName, formData);
      } else {
        await createSetup(formData);
      }
      window.location.reload();
    } catch {
      alert("Failed to create setup");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    try {
      setLoading(true);
      await createSetup({
        name: newTypeName,
        setupType: newTypeName.toUpperCase(),
        description: "Root Type",
        enabled: true,
      });
      window.location.reload();
    } catch {
      alert("Failed to create type");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="header-container">
      <h2 className="page-title" style={{ marginLeft: "30px" }}>
        TecHSup{" "}
      </h2>

      <div className="dropdown">
        <button className="add-btn" style={{ marginRight: "30px" }}>
          + ADD SETUP
        </button>
        <div className="dropdown-content">
          <button onClick={() => openModal("setup")}>New Setup</button>
          <button onClick={() => openModal("type")}>New Root Type</button>
        </div>
      </div>

      {/* --- MODAL STRUCTURE --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>
                {modalType === "setup" ? "Add New Setup" : "Add New Root Type"}
              </h3>
              <button className="close-x" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form
              onSubmit={modalType === "setup" ? handleSubmit : handleCreateType}
              className="modal-form"
            >
              <div className="form-grid">
                {modalType === "setup" ? (
                  <>
                    <div className="form-group full-width">
                      <label>Setup Name *</label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter name"
                      />
                      {errors.name && (
                        <span className="error">{errors.name}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Category Type *</label>
                      <select
                        name="setupType"
                        value={formData.setupType}
                        onChange={handleChange}
                      >
                        <option value="">Select Type</option>
                        {types.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  
                    <div className="form-group">
                      <label>Parent Setup</label>
                      <select
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleChange}
                      >
                        <option value="">No Parent (Root)</option>
                        {parents.map((p) => (
                          <option key={p.name} value={p.name}>
                            {"— ".repeat(p.level)}
                            {`${p.name} (${p.setupType})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label>Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter details..."
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-group full-width">
                    <label>Root Type Name *</label>
                    <input
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder="e.g. COUNTRY OR SCHOOLS OR ELECTRONICS etc"
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : modalType === "setup"
                      ? "Add Setup"
                      : "Add Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

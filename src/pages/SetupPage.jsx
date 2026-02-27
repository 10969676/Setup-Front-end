import { useEffect, useState, useCallback } from "react";
import {
  searchSetups,
  getAllTrees,
  getByType,
} from "../api/setupApi";

import SetupForm from "../components/SetupForm";
import SetupTable from "../components/SetupTable";
import Pagination from "../components/Pagination";
import SetupTree from "../components/SetupTree";

export default function SetupPage() {
  const [data, setData] = useState([]);
  const [tree, setTree] = useState([]);
  const [types, setTypes] = useState([]);

  const [page, setPage] = useState(0);
  const [size,setSize] = useState(5);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =============================
  // LOAD TABLE
  // =============================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let res;

      if (selectedType) {
        // 🔥 FILTER USING getByTypes
        res = await getByType(selectedType);

        setData(res.data || []);
        setTotalPages(1);
        setTotalElements(res.data.length || 0);
      } else {
        // 🔥 NORMAL SEARCH
        res = await searchSetups({ search, page, size });

        setData(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load setups");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [search, page, size, selectedType]);

  // =============================
  // LOAD TREE + TYPES
  // =============================
  const loadTree = useCallback(async () => {
    try {
      const res = await getAllTrees();
      const treeData = res.data || [];

      setTree(treeData);

      // Extract types dynamically
      const typeSet = new Set();

      const traverse = (nodes) => {
        nodes.forEach((n) => {
          if (n.setupType) typeSet.add(n.setupType);
          if (n.children?.length) traverse(n.children);
        });
      };

      traverse(treeData);
      setTypes([...typeSet]);
    } catch (err) {
      console.error("Tree Load Error:", err);
    }
  }, []);

  // =============================
  // FULL REFRESH
  // =============================
  const handleFullRefresh = useCallback(async () => {
    await Promise.all([loadData(), loadTree()]);
  }, [loadData, loadTree]);

  // =============================
  // EFFECTS
  // =============================
  useEffect(() => {
    const delay = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(delay);
  }, [loadData]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  return (
    <div className="page-container">
      


      {/* FORM */}
      <SetupForm onSubmit={handleFullRefresh} />

      {/* FILTER BAR */}
    <div className="filter-bar" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

   <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* 2. ADD PAGE SIZE SELECTOR */}
        <div className="size-selector">
          <label htmlFor="pageSize">Rows: </label>
          <select
            id="pageSize"
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0); // Reset to first page when changing size
            }}
          >
            {[5, 10, 15, 20].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>

        <div className="stats">
          Total: {totalElements} | Pages: {totalPages}
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <SetupTable data={data} onRefresh={handleFullRefresh} />
      )}

      {/* PAGINATION */}
      {!selectedType && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* TREE */}
      <h3>Organization Tree</h3>
      <SetupTree nodes={tree} />
    </div>
  );
}
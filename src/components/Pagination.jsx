// import React from 'react';

// export default function PacmanPagination({ page, totalPages, onPageChange }) {
//   if (totalPages === 0) return null;

//   const pages = [...Array(totalPages).keys()];

//   return (
//     <div style={{ 
//       marginTop: "20px", 
//       display: "flex", 
//       alignItems: "center", 
//       gap: "10px",
//       backgroundColor: "#575555", // Classic black background
//       padding: "10px",
//       width: "80%",
//       borderRadius: "8px"
//     }}>
//       {pages.map((p) => {
//         /* Render Pac-Man for the active page */
//         if (p === page) {
//           return (
//             <div
//               key={p}
//               onClick={() => onPageChange(p)}
//               style={{
//                 cursor: "pointer",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 transition: "all 0.2s ease"
//               }}
//             >
//               <div style={{
//                 width: "24px",
//                 height: "24px",
//                 backgroundColor: "#FFFF00", // Pac-Man yellow
//                 borderRadius: "50%",
//                 clipPath: "polygon(100% 0%, 100% 35%, 50% 50%, 100% 65%, 100% 100%, 0% 100%, 0% 0%)", // Mouth shape
//                 transform: "rotate(0deg)" 
//               }} />
//             </div>
//           );
//         }
        
//         /* Render Pac-Dots for inactive pages */
//         return (
//           <div
//             key={p}
//             onClick={() => onPageChange(p)}
//             style={{
//               cursor: "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               transition: "all 0.2s ease"
//             }}
//           >
//             <div style={{
//               width: "8px",
//               height: "8px",
//               backgroundColor: "#ffb8ae", // Classic pellet pink/tan
//               borderRadius: "2px" // Slightly rounded squares like your image
//             }} />
//           </div>
//         );
//       })}
//     </div>
//   );
// }



// Pagination component to navigate through pages of setups
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  // Common button styles
  const buttonStyle = {
    width: "40px",
    height: "40px",
    margin: "0 5px",
    border: "1px solid #e0e0e0",
    borderRadius: "50%", // Makes buttons circular
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  };

  return (
    <div style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
      {/* Previous Arrow */}
      <button
        style={{ ...buttonStyle, backgroundColor: "#fff", color: "#888" }}
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        {"<"}
      </button>

      {/* Page Numbers */}
      {pages.map((p) => (
        <button
          key={p}
          style={{
            ...buttonStyle,
            backgroundColor: p === page ? "#4285f4" : "#fff", // Google blue for active
            color: p === page ? "#fff" : "#666",
            border: p === page ? "none" : "1px solid #e0e0e0",
          }}
          onClick={() => onPageChange(p)}
        >
          {p + 1}
        </button>
      ))}

      {/* Next Arrow */}
      <button
        style={{ ...buttonStyle, backgroundColor: "#fff", color: "#888" }}
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        {">"}
      </button>
    </div>
  );
}



/*
// Pagination component to navigate through pages of setups
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages === 0) return null; 

  const pages = [...Array(totalPages).keys()]; // Create array of page numbers [0, 1, 2, ...]

  return (
    <div style ={{marginTop: "10px"}}>
      {pages.map((p) => (
        <button
          key={p}
          style={{ margin: "0 3px",
            padding: "5px 10px",
            backgroundColor: p===page? "#be3434":"#eee",
            color: p===page? "#35c064":"#000",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => onPageChange(p)}   
        >
          {p + 1}
        </button>
      ))}
    </div>
  );
} 
*/

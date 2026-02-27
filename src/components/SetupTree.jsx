export default function SetupTree({ nodes }) {
  return (
    <ul>
      {nodes.map((n) => (
        <li key={n.uuid}>
          <strong>{n.name}</strong> ({n.setupType})
          {n.children && n.children.length > 0 && (
            <SetupTree nodes={n.children} />
          )}
        </li>
      ))}
    </ul>
  );
}
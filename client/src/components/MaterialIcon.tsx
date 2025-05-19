import React from 'react';

const MaterialIcon = ({ icon, className = '' }: { icon: string; className?: string }) => {
  return <span className={`material-symbols-outlined ${className}`}>{icon}</span>;
};

export { MaterialIcon }; 
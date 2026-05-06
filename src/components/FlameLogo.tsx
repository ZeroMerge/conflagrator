import React from 'react';

interface Props { className?: string; color?: string; }

const FlameLogo: React.FC<Props> = ({ className = 'w-6 h-6' }) => (
  <img src="/images/logo.png" alt="Logo" className={className} />
);

export default FlameLogo;

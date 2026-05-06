import React from 'react';

interface Props { className?: string; color?: string; }

const FlameLogo: React.FC<Props> = ({ className = 'w-8 h-8' }) => (
  <img src="/images/logo.png" alt="Logo" className={className} />
);

export default FlameLogo;

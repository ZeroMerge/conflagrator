import React from 'react';

interface Props { className?: string; color?: string; }

const FlameLogo: React.FC<Props> = ({ className = 'w-8 h-8', color = '#F4F3F0' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* The Ignition Point — abstract spark / asymmetric 4-point star */}
    <line x1="20" y1="2" x2="20" y2="38" stroke={color} strokeWidth="3.5" strokeLinecap="square"/>
    <line x1="2" y1="20" x2="38" y2="20" stroke={color} strokeWidth="3.5" strokeLinecap="square"/>
    <line x1="7" y1="7" x2="33" y2="33" stroke={color} strokeWidth="2" strokeLinecap="square"/>
    <line x1="33" y1="7" x2="7" y2="33" stroke={color} strokeWidth="2" strokeLinecap="square" opacity="0.4"/>
    <rect x="17" y="17" width="6" height="6" fill={color}/>
  </svg>
);

export default FlameLogo;

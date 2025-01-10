import React, { FunctionComponent } from 'react';

interface BearIconProps {
  className?: string;
}

export const BearIcon: FunctionComponent<BearIconProps> = ({ className = '' }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-32 h-32 mx-auto ${className}`}
  >
    {/* Orejas */}
    <circle cx="60" cy="60" r="25" fill="#8B5E3C" />
    <circle cx="140" cy="60" r="25" fill="#8B5E3C" />
    <circle cx="60" cy="60" r="15" fill="#FFE0B2" />
    <circle cx="140" cy="60" r="15" fill="#FFE0B2" />

    {/* Cara */}
    <circle cx="100" cy="110" r="60" fill="#8B5E3C" />

    {/* Hocico */}
    <ellipse cx="100" cy="120" rx="30" ry="25" fill="#FFE0B2" />
    <ellipse cx="100" cy="125" rx="12" ry="8" fill="#6D4C41" />

    {/* Ojos */}
    <circle cx="75" cy="95" r="8" fill="#424242" />
    <circle cx="125" cy="95" r="8" fill="#424242" />

    {/* Mejillas */}
    <circle cx="70" cy="110" r="10" fill="#FFCDD2" opacity="0.6" />
    <circle cx="130" cy="110" r="10" fill="#FFCDD2" opacity="0.6" />
  </svg>
);


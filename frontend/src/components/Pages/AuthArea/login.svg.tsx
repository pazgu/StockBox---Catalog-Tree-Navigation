import React from 'react';

const NestedCatalogSVG = () => {
  return (
    <svg viewBox="0 0 900 600" className="w-full h-auto">
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3B5998', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#2D4373', stopOpacity: 1 }} />
        </linearGradient>
        
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="10" floodOpacity="0.2"/>
        </filter>

        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background decorative elements */}
      <circle cx="100" cy="100" r="60" fill="#3B5998" opacity="0.08"/>
      <circle cx="800" cy="500" r="80" fill="#3B5998" opacity="0.06"/>
      <circle cx="850" cy="80" r="50" fill="#3B5998" opacity="0.1"/>

      {/* Main folder/catalog structure - horizontal layout */}
      <g transform="translate(150, 120)">
        
        {/* Large folder container */}
        <path 
          d="M 0 60 L 0 360 Q 0 380 20 380 L 580 380 Q 600 380 600 360 L 600 60 Q 600 40 580 40 L 120 40 L 100 10 Q 95 0 80 0 L 20 0 Q 0 0 0 20 Z"
          fill="url(#blueGradient)"
          filter="url(#shadow)"
        />

        {/* Folder tab accent */}
        <path 
          d="M 0 20 L 0 60 L 600 60 L 600 40 Q 600 40 580 40 L 120 40 L 100 10 Q 95 0 80 0 L 20 0 Q 0 0 0 20 Z"
          fill="#2D4373"
        />

        {/* Three category cards inside - horizontal arrangement */}
        
        {/* Card 1 */}
        <g transform="translate(40, 100)">
          <rect 
            x="0" y="0" 
            width="150" height="240" 
            rx="12" 
            fill="white" 
            filter="url(#shadow)"
          />
          {/* Header */}
          <rect x="15" y="15" width="120" height="8" rx="4" fill="#3B5998" opacity="0.8"/>
          <rect x="15" y="30" width="80" height="6" rx="3" fill="#3B5998" opacity="0.4"/>
          
          {/* Grid items */}
          <rect x="15" y="55" width="55" height="55" rx="8" fill="#3B5998" opacity="0.15"/>
          <rect x="80" y="55" width="55" height="55" rx="8" fill="#3B5998" opacity="0.15"/>
          <rect x="15" y="120" width="55" height="55" rx="8" fill="#3B5998" opacity="0.1"/>
          <rect x="80" y="120" width="55" height="55" rx="8" fill="#3B5998" opacity="0.1"/>
          
          {/* Bottom details */}
          <circle cx="30" cy="200" r="4" fill="#3B5998" opacity="0.6"/>
          <rect x="40" y="197" width="50" height="5" rx="2" fill="#3B5998" opacity="0.3"/>
          <circle cx="30" cy="215" r="4" fill="#3B5998" opacity="0.6"/>
          <rect x="40" y="212" width="65" height="5" rx="2" fill="#3B5998" opacity="0.3"/>
        </g>

        {/* Card 2 */}
        <g transform="translate(225, 100)">
          <rect 
            x="0" y="0" 
            width="150" height="240" 
            rx="12" 
            fill="white" 
            filter="url(#shadow)"
          />
          {/* Header */}
          <rect x="15" y="15" width="100" height="8" rx="4" fill="#3B5998" opacity="0.8"/>
          <rect x="15" y="30" width="90" height="6" rx="3" fill="#3B5998" opacity="0.4"/>
          
          {/* List items with icons */}
          <circle cx="25" cy="65" r="8" fill="#3B5998" opacity="0.2"/>
          <rect x="40" y="60" width="90" height="6" rx="3" fill="#3B5998" opacity="0.4"/>
          <rect x="40" y="70" width="70" height="4" rx="2" fill="#3B5998" opacity="0.25"/>
          
          <circle cx="25" cy="100" r="8" fill="#3B5998" opacity="0.2"/>
          <rect x="40" y="95" width="85" height="6" rx="3" fill="#3B5998" opacity="0.4"/>
          <rect x="40" y="105" width="75" height="4" rx="2" fill="#3B5998" opacity="0.25"/>
          
          <circle cx="25" cy="135" r="8" fill="#3B5998" opacity="0.2"/>
          <rect x="40" y="130" width="80" height="6" rx="3" fill="#3B5998" opacity="0.4"/>
          <rect x="40" y="140" width="65" height="4" rx="2" fill="#3B5998" opacity="0.25"/>
          
          <circle cx="25" cy="170" r="8" fill="#3B5998" opacity="0.15"/>
          <rect x="40" y="165" width="90" height="6" rx="3" fill="#3B5998" opacity="0.3"/>
          <rect x="40" y="175" width="70" height="4" rx="2" fill="#3B5998" opacity="0.2"/>
          
          <circle cx="25" cy="205" r="8" fill="#3B5998" opacity="0.15"/>
          <rect x="40" y="200" width="75" height="6" rx="3" fill="#3B5998" opacity="0.3"/>
          <rect x="40" y="210" width="80" height="4" rx="2" fill="#3B5998" opacity="0.2"/>
        </g>

        {/* Card 3 */}
        <g transform="translate(410, 100)">
          <rect 
            x="0" y="0" 
            width="150" height="240" 
            rx="12" 
            fill="white" 
            filter="url(#shadow)"
          />
          {/* Header */}
          <rect x="15" y="15" width="110" height="8" rx="4" fill="#3B5998" opacity="0.8"/>
          <rect x="15" y="30" width="75" height="6" rx="3" fill="#3B5998" opacity="0.4"/>
          
          {/* Mixed content - image + text blocks */}
          <rect x="15" y="55" width="120" height="70" rx="8" fill="#3B5998" opacity="0.12"/>
          <rect x="25" y="135" width="100" height="5" rx="2" fill="#3B5998" opacity="0.4"/>
          <rect x="25" y="145" width="110" height="4" rx="2" fill="#3B5998" opacity="0.3"/>
          <rect x="25" y="153" width="90" height="4" rx="2" fill="#3B5998" opacity="0.3"/>
          
          <rect x="15" y="175" width="55" height="50" rx="6" fill="#3B5998" opacity="0.1"/>
          <rect x="80" y="175" width="55" height="50" rx="6" fill="#3B5998" opacity="0.1"/>
        </g>

        {/* Decorative dots indicating more items */}
        <circle cx="300" cy="365" r="5" fill="white" opacity="0.4"/>
        <circle cx="280" cy="365" r="5" fill="white" opacity="0.4"/>
        <circle cx="320" cy="365" r="5" fill="white" opacity="0.4"/>
      </g>

      {/* Floating connector lines */}
      <line x1="100" y1="300" x2="150" y2="280" stroke="#3B5998" strokeWidth="2" opacity="0.15" strokeDasharray="4,4"/>
      <line x1="800" y1="350" x2="750" y2="380" stroke="#3B5998" strokeWidth="2" opacity="0.15" strokeDasharray="4,4"/>

      {/* Small decorative elements */}
      <rect x="80" y="450" width="30" height="30" rx="6" fill="#3B5998" opacity="0.08"/>
      <rect x="790" y="150" width="25" height="25" rx="5" fill="#3B5998" opacity="0.1"/>
    </svg>
  );
};

export default NestedCatalogSVG;
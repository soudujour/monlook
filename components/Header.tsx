import React from 'react';

// Embedded SVG logo to ensure reliability and correct rendering without external dependencies.
// Replicates the "Du Jour" brand logo: Circle symbol, serif logotype, and slogan.
const logoSvg = `
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="65" r="35" fill="none" stroke="#7da1b0" stroke-width="3"/>
  <text x="150" y="140" font-family="Times New Roman, serif" font-size="60" fill="#7da1b0" text-anchor="middle">du jour</text>
  <text x="150" y="165" font-family="Arial, sans-serif" font-size="11" fill="#7da1b0" text-anchor="middle" letter-spacing="2">O BRILHO S&#218;TIL DE CADA DIA</text>
</svg>
`.trim();

const logoSrc = `data:image/svg+xml;base64,${btoa(logoSvg)}`;

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-1 flex justify-center items-center">
         <img src={logoSrc} alt="DuJour Logo" className="h-32 md:h-40" />
      </div>
    </header>
  );
};
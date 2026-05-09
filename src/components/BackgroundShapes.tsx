import React from "react";

export default function BackgroundShapes() {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, left: 0, right: 0, bottom: 0, 
        pointerEvents: 'none', 
        zIndex: -1,
        overflow: 'hidden'
      }}
    >
      <div 
        className="bg-shape shape-circle-red" 
        style={{ width: '300px', height: '300px', top: '-100px', left: '-100px' }} 
      />
      <div 
        className="bg-shape shape-square-yellow" 
        style={{ width: '400px', height: '400px', top: '20%', right: '-150px', transform: 'rotate(15deg)' }} 
      />
      <div 
        className="bg-shape shape-rect-green" 
        style={{ width: '250px', height: '350px', bottom: '-50px', left: '10%', transform: 'rotate(-10deg)' }} 
      />
      <div 
        className="bg-shape shape-circle-blue" 
        style={{ width: '150px', height: '150px', bottom: '15%', right: '15%' }} 
      />
    </div>
  );
}

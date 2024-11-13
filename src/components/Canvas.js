import React, { useRef, useEffect } from 'react';

// Canvas komponenta koja prima funkciju draw kao prop
const Canvas = ({ draw }) => {
  // Ref za povezivanje s HTML canvas elementom
  const canvasRef = useRef(null);

  useEffect(() => {
    // Dohvaćanje canvas elementa i konteksta za crtanje
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Postavlja širinu i visinu canvasa na širinu i visinu ekrana
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Funkcija koja poziva draw u svakom frame-u
    let animationFrameId;
    const render = () => {
      draw(context);  // Pozivanje funkcije koja crta sadržaj na canvas
      animationFrameId = requestAnimationFrame(render);  // Sljedeći frame za animaciju
    };
    render();  // Pokretanje animacije

    // Cleanup funkcija koja se poziva kada komponenta bude unmount
    return () => cancelAnimationFrame(animationFrameId);
  }, [draw]);  // Učitaj ponovno svaki put kada draw funkcija promijeni

  return <canvas ref={canvasRef}/>;  // Renderiraj canvas element
};

export default Canvas;

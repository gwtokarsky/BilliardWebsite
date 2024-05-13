import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Console } from 'console';

interface Polygon {
  points: [number, number][];
  fillColor: string;
}

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [scale, setScale] = useState(500);
  const [renderFlag, setRenderFlag] = useState(false);
  const [translate, setTranslate] = useState([0, 0]);

  useEffect(() => {
    const canvasSize = Math.min(window.innerWidth, window.innerHeight) / 1.5;
    setScale(canvasSize);

    // Rest of your code...

    
    const polygons: Polygon[] = [
      {
        points: [[0, canvasSize], [0, 0], [canvasSize, canvasSize]],
        fillColor: 'grey'
      },
      {
        points: [
          [500, 500],
          [500, 250],
          [250, 250],
          [250, 500]
        ],
        fillColor: 'green'
      }
    ];

    const canvas = d3.select(canvasRef.current);

    const context = canvas.node()!.getContext('2d');

    if (!context) {
      throw new Error("Could not create 2D rendering context.");
    }

    const render = () => {
      context.clearRect(-10000, -10000, context.canvas.width * 10000, context.canvas.height * 10000);
      context.save();

      context.scale(zoom, zoom);

      context.translate(translate[0] / zoom, translate[1] / zoom); // Update translation with zoom

      polygons.forEach(polygon => {
        context.beginPath();
        context.moveTo((polygon.points[0][0]), polygon.points[0][1]);
        polygon.points.slice(1).forEach(point => {
          context.lineTo(point[0], point[1]);
        });
        context.closePath();
        context.fillStyle = polygon.fillColor;
        context.fill();
      });

      context.restore();
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        // Adjust mouse position based on scale factor
        const adjustedX = (relativeX - translate[0]) / scale * 180 / zoom;
        const adjustedY = 180 - (relativeY - translate[1]) / scale * 180 / zoom;

        setMousePosition({ 
        x: adjustedX,
        y: adjustedY
        });
    };

    const zoomBehavior: any = d3.zoom().on('zoom', (event) => {
      setZoom(event.transform.k);
      setTranslate([event.transform.x, event.transform.y]);
    });

    // Render initial state
    render();

    // Add zoom behavior
    canvas.call(zoomBehavior);

    // Add event listeners when component mounts
    canvasRef.current!.addEventListener('mousemove', handleMouseMove);

    if (!renderFlag) {
      setRenderFlag(true);
    }
    // Clean up event listeners when component unmounts
    return () => {
      canvasRef.current!.removeEventListener('mousemove', handleMouseMove);
    };




  }, [zoom, renderFlag]); // Re-run effect when zoom changes

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={scale}
        height={scale}
      />
      <div style={{ position: 'fixed', top: '10px', left: '80px' }}>
        <p>Displaced Mouse Position:</p>
        <p>X: {mousePosition.x}</p>
        <p>Y: {mousePosition.y}</p>
        <p>Zoom: {zoom.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default Game;
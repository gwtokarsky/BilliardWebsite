import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Polygon {
  points: [number, number][];
  fillColor: string;
}

const polygons: Polygon[] = [
  {
    points: [
      [50, 50],
      [150, 50],
      [150, 150],
      [50, 150]
    ],
    fillColor: 'blue'
  },
  {
    points: [
      [200, 200],
      [300, 200],
      [300, 300],
      [200, 300]
    ],
    fillColor: 'green'
  }
];

const canvasWidth = 500;
const canvasHeight = 500;

const MyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = d3.select(canvasRef.current);
    const context = canvas.node()!.getContext('2d');

    if (!context) {
      throw new Error("Could not create 2D rendering context.");
    }

    polygons.forEach(polygon => {
      context.beginPath();
      context.moveTo(polygon.points[0][0], polygon.points[0][1]);
      polygon.points.slice(1).forEach(point => {
        context.lineTo(point[0], point[1]);
      });
      context.closePath();
      context.fillStyle = polygon.fillColor;
      context.fill();
    });
  }, []);

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />;
};

export default MyCanvas;
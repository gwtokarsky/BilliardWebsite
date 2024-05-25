"use client";
import React, { useState, useEffect, useRef, use } from 'react';
import * as d3 from 'd3';
import { Console } from 'console';
import { getCoversFromRegionWithCorners, getCoversWithCorners, getRegionsWithCorners} from '@/actions/actions';
import { get } from 'http';

interface Polygon {
  points: [number, number][];
  fillColor?: string;
  fillOpacity?: number;
  stroke?: string;
}


const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [scale, setScale] = useState(500);
  const [renderFlag, setRenderFlag] = useState(false);
  const [translate, setTranslate] = useState([0, 0]);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [selectedCover, setSelectedCover] = useState(null);
  const [selectedCorners, setSelectedCorners] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [isSelectedComplete, setIsSelectedComplete] = useState(false);
  const [regions, setRegions] = useState([]);
  const [covers, setCovers] = useState([]);


  const loadRegions = async () => {
    const response = await getRegionsWithCorners();
    await setRegions(response);
    const response2 = await getCoversWithCorners();
    await setCovers(response2);
  };

  const getRegions = async () => {
    const canvasSize = Math.min(window.innerWidth, window.innerHeight) / 1.5;
    const p: Polygon[] = [
      {
        points: [[0, canvasSize], [0, 0], [canvasSize, canvasSize]],
        fillColor: 'grey',
      },
    ];

    regions.map(async (region: any) => {
      const corners = region.corners.map((corner: any) => [corner.f1 / 180 * canvasSize, (180 - corner.f2) / 180 * canvasSize]);  
      const polygon: Polygon = {
        points: corners,
        fillColor: region.region_color
      };

      p.push(polygon);
      await setPolygons(p);
      await new Promise(r => setTimeout(r, 1000));
    });


    covers.map(async (region: any) => {
      const corners = region.corners.map((corner: any) => [corner.f1 / 180 * canvasSize, (180 - corner.f2) / 180 * canvasSize]);  
      const polygon: Polygon = {
        points: corners,
        stroke: 'maroon',
      };

      p.push(polygon);
      await setPolygons(p);
      await new Promise(r => setTimeout(r, 1000));
    });
  };

  const findContainingCover = async (x: number, y: number) => {
    const canvasSize = Math.min(window.innerWidth, window.innerHeight) / 1.5;
    console.log(x,y)
    const response = await getRegionsWithCorners();
    let containing_region = null;
    for (let i = 0; i < response.length; i++) {
      console.log(response[i].corners)
      const corners = response[i].corners.map((corner: any) => [corner.f1, corner.f2]);
      console.log(corners);
      if(d3.polygonContains(corners, [x, y])) {
        containing_region = response[i];
        console.log(containing_region);
        break;
      }
    }
    if (!containing_region) {
      return null;
    }
    const response2 = await getCoversFromRegionWithCorners(containing_region.region_id);
    console.log(response2);
    let containing_cover = null;
    for (let i = 0; i < response2.length; i++) {
      const corners = response2[i].corners.map((corner: any) => [corner.f1, corner.f2]);
      console.log(corners);
      if(d3.polygonContains(corners, [x, y])) {
        containing_cover = response2[i];
        break;
      }
    }
    console.log(containing_cover);
    return containing_cover;
  };


  useEffect(() => {
    const canvasSize = Math.min(window.innerWidth, window.innerHeight) / 1.5;
    setScale(canvasSize);

    getRegions();

    const canvas = d3.select(canvasRef.current);

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

  useEffect(() => {
    getRegions();
    render();
  }, [covers]);

  useEffect(() => {
    const handleMouseClick = async (e: MouseEvent) => {
      let cover = await findContainingCover(mousePosition.x, mousePosition.y);
      if (cover !== null) {
        await setSelectedCover(cover);
      }
    };
    canvasRef.current!.removeEventListener('click', handleMouseClick);
    canvasRef.current!.addEventListener('click', handleMouseClick);
    return () => {
      canvasRef.current!.removeEventListener('click', handleMouseClick);
    };
  }, [mousePosition]);

  useEffect(() => {
    loadRegions();
  }
  , []);

  const polygonLength = (polygon: Polygon) => {
    //get maximum distance between two consecutive points
    let maxDistance = 0;
    polygon.points.forEach((point, index) => {
      const nextPoint = polygon.points[(index + 1) % polygon.points.length];
      const distance = Math.sqrt((nextPoint[0] - point[0]) ** 2 + (nextPoint[1] - point[1]) ** 2);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    });
    return maxDistance;
  };


  const render = () => {
    const canvas = d3.select(canvasRef.current);
    canvas.style('border', '3px solid black');

    const context = canvas.node()!.getContext('2d');

    if (!context) {
      throw new Error("Could not create 2D rendering context.");
    }
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
      context.fillStyle = polygon.fillColor ?? 'transparent';
      context.lineWidth = Math.min((polygonLength(polygon) / 25), 4/zoom);
      context.strokeStyle =  polygon.stroke ?? 'black';
      context.stroke();
      context.globalAlpha = polygon.fillOpacity ?? 1;
      
      context.fill();
    });

    context.restore();
  };

  useEffect(() => {
    render();
  }, [polygons]);

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
        <p>Selected Cover: {(selectedCover as any) ? (selectedCover as any).cover_id : 'None'}</p>
        <p>Selected Points: {(selectedCover as any) ? (selectedCover as any).cover_points : 'None'}</p>
        <p>Selected Cover: {(selectedCover as any) ? (JSON.stringify((selectedCover as any).corners)) : 'None'}</p>
      </div>
    </div>
  );
};

export default Game;
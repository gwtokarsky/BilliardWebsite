import React, { useState, useEffect } from 'react';
import { Stage, Container, Graphics, Text } from '@pixi/react';
import PolygonBuilder from './polygonBuilder';

const pixel_offset_byscale=[]

const Game = () => {
    const [points, setPoints] = useState([[[0,0],[0,0],[0,0]],[[0,0],[0,0],[0,0]]]);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [borderColor, setBorderColor] = useState(0x000000); // Use hexadecimal for color
    const [colors, setColor] = useState([0x800000, 0x808080, 0x808080, 0x808080, 0x062e03, 0x0000ff, 0xff0000, 0xffff00, 0x800080, 0xffa500, 0xffc0cb, 0xa52a2a]); // Use hexadecimal for color
    const [zoom, setZoom] = useState(6);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [val, setVal] = useState(1)

    useEffect(() => {
        const scale = Math.min(window.innerHeight , window.innerWidth) / 200;
        setVal(scale);
        const start = [window.innerWidth/2 - scale*75,0]
        setPoints([
            [[0, 180 * scale], [0, 0], [180 * scale, 180 * scale]],
            [[0, 0], [90 * scale, 90 * scale], [0, 90 * scale]],
            [[90 * scale, 180 * scale], [180 * scale, 180 * scale], [90 * scale, 90 * scale]], 
            [[0, 180 * scale], [45 * scale, 135 * scale], [90 * scale, 180 * scale]],
            [[0, 90 * scale], [90 * scale, 90 * scale], [90 * scale, 180 * scale]],
            [[6 * scale,(180 - 39) * scale], [9 * scale,(180 - 36) * scale], [9 * scale,(180 - 26) * scale], [6 * scale,(180 - 29) * scale]],
        ]); 
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);

        const handleMouseMove = (e:any) => {
            const stageElement = document.querySelector('canvas');
            if (!stageElement) {
                return;
            }

            const rect = stageElement.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const relativeY = e.clientY - rect.top;

            // Update the state with the relative mouse position
            setMousePosition({ x: relativeX / scale, y: relativeY / scale });
        };

        // Add event listener when component mounts
        document.addEventListener('mousemove', handleMouseMove);

        // Clean up event listener when component unmounts
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const foo = () => {
        let polygons = [];
        for (let i = 0; i < points.length; i++) {
            polygons.push(
                <Container scale={zoom} key={i}>
                    <PolygonBuilder points={points[i]} borderColor={borderColor} color={colors[i]}/>
                </Container>
            );
        }
        return polygons;
    }

    return (
        <div>
            <Stage width={val*190*zoom} height={val*190*zoom} options={{ backgroundColor: 0xffffff }} style={{position:'absolute', left:'10px', top:'10px'}}>
                {foo()}
            </Stage>

            <div style={{ position: 'fixed', top: '10px', left: '80px' }}>
                <p>Displaced Mouse Position:</p>
                <p>X: {(mousePosition.x) / zoom}</p>
                <p>Y: {(-mousePosition.y)/zoom + 180}</p>
            </div>
        </div>
    );
};

export default Game;
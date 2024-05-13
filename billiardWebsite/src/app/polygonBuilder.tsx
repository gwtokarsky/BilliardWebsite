import React from 'react';
import { Graphics } from '@pixi/react';

interface PolygonBuilderProps {
    points: Array<Array<number>>;
    borderColor: number; // Change borderColor type to number for hexadecimal representation
    color: number; // Change color type to number for hexadecimal representation
}

const PolygonBuilder = (props: PolygonBuilderProps) => {
    const { points, borderColor, color } = props;

    return (
        <Graphics
            draw={(g:any) => {
                g.clear(); // Clear any previous drawings

                if (points !== undefined && points.length > 0) {
                    g.lineStyle(2, borderColor, 1); // Set border color and thickness

                    // Move to the starting point of the polygon
                    g.moveTo(points[0][0], points[0][1]);

                    // Draw lines to connect the points and form the polygon
                    for (let i = 1; i < points.length; i++) {
                        g.lineTo(points[i][0], points[i][1]);
                    }

                    // Close the path
                    g.closePath();

                    // Fill the polygon with color
                    g.beginFill(color);
                    g.drawPolygon(points.flat());
                    g.endFill();
                }
            }}
        />
    );
};

export default PolygonBuilder;
import rough from "roughjs/bin/rough";
import getStroke from "perfect-freehand";

import {  isPointCloseToLine } from "./math";

export const  createElement = (id,x1, y1, x2, y2, {type,stroke,fill,size}) => {


    const gen = rough.generator();


    const element = { id, x1, y1, x2, y2, type };
    let options = {
        seed : id+1,
        stroke: stroke,
        fill: fill,
        fillStyle : fill ? "solid" : "hachure",
        strokeWidth:size,
    }
    switch (type) {
        case "line":
            {
                element.roughElement = gen.line(x1, y1, x2, y2, options);
                return element;

            }
  
        case "rectangle":
            {
                element.roughElement = gen.rectangle(x1, y1, x2 - x1, y2 - y1, options);
                return element;
            }
        case "ellipse":
            {
                const radiusX = Math.abs(x2 - x1) / 2;
                const radiusY = Math.abs(y2 - y1) / 2;
                element.roughElement = gen.ellipse(x1 + radiusX, y1 + radiusY, radiusX * 2, radiusY * 2, options);
                return element;

            }
        case "arrow":
            {
                const angle = Math.atan2(y2 - y1, x2 - x1);
                const headLength = 15; 
                const x3 = x2 - headLength * Math.cos(angle - Math.PI / 6);
                const y3 = y2 - headLength * Math.sin(angle - Math.PI / 6);
                const x4 = x2 - headLength * Math.cos(angle + Math.PI / 6);
                const y4 = y2 - headLength * Math.sin(angle + Math.PI / 6);

                const arrowPath = `M ${x1} ${y1} L ${x2} ${y2} M ${x3} ${y3} L ${x2} ${y2} L ${x4} ${y4}`;

                
                element.roughElement = gen.path(arrowPath, options);
    
                return element;
            }
        case "brush":
            {
                const brushElement = { 
                    id, 
                    points:[{x:x1,y:y1}] ,
                    path: new Path2D(getSvgPathFromStroke(getStroke([{ x: x1, y: y1 }],{ size: Number(size)} ))),
                    type,
                    stroke,
                    size: Number(size),
                };

                return brushElement; 



            }

        case "text":
            {
                const textElement = {
                    id,
                    x1,
                    y1,
                    type,
                    stroke,
                    size: Number(size),
                    text: "",
                };
                
                return textElement;
            }

        default:
            throw new Error(`Unknown element type: ${type}`);
            
    }


}

export const isPointNearElement = (pointX, pointY, element) => {
  const { x1, y1, x2, y2, type } = element;
  
  switch (type.toLowerCase()) {
    case "line":
    case "arrow":
      return isPointCloseToLine(x1, y1, x2, y2, pointX, pointY);
      
    case "rectangle":
      return (
        isPointCloseToLine(x1, y1, x2, y1, pointX, pointY) ||
        isPointCloseToLine(x2, y1, x2, y2, pointX, pointY) ||
        isPointCloseToLine(x2, y2, x1, y2, pointX, pointY) ||
        isPointCloseToLine(x1, y2, x1, y1, pointX, pointY)
      );

    case "ellipse": 
      {
        
        const radiusX = Math.abs(x2 - x1) / 2;
        const radiusY = Math.abs(y2 - y1) / 2;
        const centerX = x1 + radiusX;
        const centerY = y1 + radiusY;
        const dx = pointX - centerX;
        const dy = pointY - centerY;
       
        const normalizedDistance = (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY);
        return normalizedDistance >= 0.8 && normalizedDistance <= 1.2;
      }
      
    case "brush":
      {
        const canvas = document.getElementById("canvas");
        if (!canvas) return false;
        const context = canvas.getContext("2d");
        const elPath = new Path2D(getSvgPathFromStroke(getStroke(element.points)));
        return context.isPointInPath(elPath, pointX, pointY);
      }
      
    case "text":
      {
        const canvas = document.getElementById("canvas");
        if (!canvas) return false;
        const context = canvas.getContext("2d");
        context.save();
        context.font = `${element.size}px Caveat`;
        context.fillStyle = element.stroke;
        const textWidth = context.measureText(element.text).width;
        const textHeight = parseInt(element.size);
        context.restore();
        return (
          isPointCloseToLine(x1, y1, x1 + textWidth, y1, pointX, pointY) ||
          isPointCloseToLine(x1 + textWidth, y1, x1 + textWidth, y1 + textHeight, pointX, pointY) ||
          isPointCloseToLine(x1 + textWidth, y1 + textHeight, x1, y1 + textHeight, pointX, pointY) ||
          isPointCloseToLine(x1, y1 + textHeight, x1, y1, pointX, pointY)
        );
      }
      
    default:
      return false; 
  }
}

export const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};
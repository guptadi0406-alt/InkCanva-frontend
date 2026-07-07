import {  useEffect,useLayoutEffect,useRef } from "react";
import rough from "roughjs";
import classes from "./index.module.css";
import { useContext } from "react";
import boardContext from "../../store/board-context";
import toolboxContext from "../../store/toolboxContext";
function Board() {
    const {elements,handleMouseDownHandler,handleMouseMoveHandler,toolActionType,handleMouseUpHandler,active,textAreaBlurHandler,boardUndoHandler,boardRedoHandler} = useContext(boardContext);

    const {toolBoxState} = useContext(toolboxContext);


  const canvasRef = useRef(null);
  const textAreaRef = useRef(null);
  useEffect(() => {

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        boardUndoHandler();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        boardRedoHandler();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [boardUndoHandler, boardRedoHandler]);

  useLayoutEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");


    const rc = rough.canvas(canvas);

    elements.forEach((el) => {
      switch (el.type) {
        case "line":
          case "rectangle":
            case "arrow":
              case "ellipse":
                {
                  rc.draw(el.roughElement);
                  break;
                }
                
                case "brush":
                  {
                    ctx.fillStyle = el.stroke;
                    ctx.fill(el.path);
                    ctx.restore();
                  }
            break;

        case "text":
          {
            ctx.textBaseline = "top";
            ctx.font = `${el.size}px Caveat`;
            ctx.fillStyle = el.stroke;
            ctx.fillText(el.text, el.x1, el.y1);
            ctx.restore();
            break;
          }

          default:
              return new Error("Type not recognized");

      }
    })

    return ()=>{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
        
  
}, [elements])

  useEffect(() => {

    const textArea = textAreaRef.current;
    if (!textArea) return;

    if(toolActionType === "WRITING"){
      setTimeout(() => {
        textArea.focus();
        
      }, 0);
    }else{
        textArea.blur();
    }

  },[toolActionType])



  const handleMouseDown=(event)=>{
    
      handleMouseDownHandler(event,toolBoxState[active]?.color,toolBoxState[active]?.fill,toolBoxState[active]?.size);
  }


  const handleMouseMove=(event)=>{

        handleMouseMoveHandler(event,toolBoxState[active]?.color,toolBoxState[active]?.fill,toolBoxState[active]?.size);
    

  }

  const handleMouseUp=()=>{
        handleMouseUpHandler();
  }

  return (
    <>
       {toolActionType==="WRITING" &&
            <textarea 
            id="textArea" 
            className={classes.textElementBox}
            ref={textAreaRef}
            style={{
        
              top:elements[elements.length-1]?.y1,
              left:elements[elements.length-1]?.x1,
              fontSize:`${elements[elements.length-1].size}px`,
              color:elements[elements.length-1]?.stroke,
            }}
            onBlur={(e)=>{textAreaBlurHandler(e.target.value,toolBoxState[active]?.color,toolBoxState[active]?.size)}}
              >

            </textarea>

       }

        <canvas id="canvas" ref={canvasRef} onMouseDown={handleMouseDown}  onMouseMove={handleMouseMove}  onMouseUp={handleMouseUp}></canvas>

    </>
  )
}

export default Board;

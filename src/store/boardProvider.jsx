import { useReducer , useCallback } from "react";
import boardContext from "./board-context";

import rough from "roughjs/bin/rough";
import { createElement, getSvgPathFromStroke , isPointNearElement } from "../utils/element";
import getStroke from "perfect-freehand";


 const gen = rough.generator();
    
const boardReducer = (state, action) => {
    switch (action.type) {
        case "CHANGE_TOOL":
            {

                return {
                    ...state,
                    active: action.payload.tool,
                }
            }
        case "CHANGE_TOOL_ACTION_TYPE":
            {
                return {
                    ...state,
                    toolActionType: action.payload.toolActionType,
                }
            }
        case "DRAW_DOWN":
            {
                const newElement = createElement(
                    state.elements.length + 1,
                    action.payload.clientX,
                    action.payload.clientY,
                    action.payload.clientX,
                    action.payload.clientY,
                    { type: state.active.toLowerCase(), stroke: action.payload.stroke, fill: action.payload.fill,size: action.payload.size}
                );

                   

                return {
                    ...state,
                    toolActionType: state.active == "Text" ? "WRITING" : "DRAWING",
                    elements: [...state.elements, newElement],
                }
            
            }

        case "DRAW_MOVE":
            {
               const { clientX, clientY  } = action.payload;
               const Elements = [...state.elements];
                const index = state.elements.length - 1;
                if (index < 0) return state;
                const type = state.active;
             


                switch (type) {
                    case "Line":
                        case "Rectangle": 
                            case "Arrow":   
                                 case "Ellipse":  
                                            {

                                                const updatedElement = createElement(
                                                    Elements[index].id,
                                                    Elements[index].x1,
                                                    Elements[index].y1,
                                                    clientX,
                                                    clientY,
                                                    { type: state.active.toLowerCase(), stroke: action.payload.stroke, fill: action.payload.fill ,size: action.payload.size}
                                                );

                                                
                                                Elements[index] = updatedElement;
                                                return {
                                                    ...state,
                                                    elements: Elements,
                                                }

                                            }

                    case "Brush":

                            {
                                const updatedElement = {
                                    ...Elements[index],
                                    points: [...Elements[index].points, { x: clientX, y: clientY }],
                                    path: new Path2D(getSvgPathFromStroke(getStroke([...Elements[index].points, { x: clientX, y: clientY }], { size: Number(action.payload.size) }))),
                             
                                }
                                Elements[index] = updatedElement;

                            
                                return {
                                    ...state,
                                    elements: Elements,
                                }

                            }

    
                    default:
                        return state;
                }

                
                
            }

        case "DRAW_UP":
            {
                return {
                    ...state,
                    toolActionType:"NONE",
                }
            }
        

        case "ERASE":
            {
                const { clientX, clientY } = action.payload;
               
                let newElements = [...state.elements];
                const newHistory = state.history.slice(0, state.index + 1);
                newHistory.push(newElements);
                newElements = newElements.filter((el) => {
                    const isNear = isPointNearElement(clientX, clientY, el);
                    return !isNear;
                });
                return {
                    ...state,
                    elements: newElements,
                    history: newHistory,
                    index: state.index + 1
                };
            }

        case "CHANGE_TEXT":
            {
                const { text,stroke,size } = action.payload;
                const Elements = [...state.elements];
                const index = state.elements.length - 1;

                const newHistory = state.history.slice(0, state.index + 1);
                newHistory.push(Elements);
                if (index < 0) return state;
                const updatedElement = {
                    ...Elements[index],
                    text: text,
                    stroke: stroke,
                    size: size
                }
                Elements[index] = updatedElement;

                return {
                    ...state,
                    elements: Elements,
                    toolActionType:"NONE",
                    index: state.index + 1,
                    history: newHistory
                }
            }

        case "SAVE_HISTORY":
            {
                const elementCopy = [...state.elements];
                const newHistory = state.history.slice(0, state.index + 1);
                newHistory.push(elementCopy);
                return {
                    ...state,
                    history: newHistory,
                    index: state.index + 1,
                }
            }

        case "UNDO":

            {
                if(state.index === 0 || state.history.length === 0) return state;
                return {
                    ...state,
                    index: Math.max(state.index - 1, 0),
                    elements: state.history[Math.max(state.index - 1, 0)],
                }
            }

        case "REDO":

            {
                if(state.index === state.history.length - 1 || state.history.length === 0) return state;
                return {
                    ...state,
                    index: Math.min(state.index + 1, state.history.length - 1),
                    elements: state.history[Math.min(state.index + 1, state.history.length - 1)],
                }
            }


        default:
            return state;
    }
}

const initialBoardState = {
    active: "Brush",
    elements: [],
    history:[[]],
    index:0,
    toolActionType: "NONE",
}



const BoardProvider = ({children}) => {

    const [boardState, dispatchBoardAction] = useReducer(boardReducer, initialBoardState);
   

        const handleTool = (tool) => {
        dispatchBoardAction({ type: "CHANGE_TOOL", payload: {tool} });
        }

        const handleMouseDownHandler = (event,stroke,fill,size) => {


            if( boardState.toolActionType === "WRITING") return;
            const clientX = event.clientX;
            const clientY = event.clientY;

            const roughele = gen.line(clientX, clientY, clientX , clientY );

            
            if(boardState.active === "Eraser"){
             
                dispatchBoardAction({ type: "CHANGE_TOOL_ACTION_TYPE", payload: { toolActionType: "ERASING" } });
                return ;
            }
            

            dispatchBoardAction({ type: "DRAW_DOWN", payload: {
                clientX,
                clientY,
                roughele,
                stroke,
                fill,
                size
            } });


        }

      

        const boardUndoHandler = useCallback(() => {

            dispatchBoardAction({ type: "UNDO", payload: {} });
        }, []);


        const boardRedoHandler = useCallback(() => {

            dispatchBoardAction({ type: "REDO", payload: {} });
        }, []);

        const handleMouseMoveHandler = (event,stroke,fill,size) => {
            if(boardState.toolActionType === "WRITING") return;
            const clientX = event.clientX;
            const clientY = event.clientY;

           

            if(boardState.toolActionType == "DRAWING"){
                 dispatchBoardAction({ type: "DRAW_MOVE", payload: {
                    clientX,
                    clientY,
                    stroke,
                    fill,
                    size
                
                } });
    
            }else if(boardState.toolActionType == "ERASING"){
                 
       
               dispatchBoardAction({ type: "ERASE", payload: {
                   clientX,
                   clientY,

               } });
            }
        }

        const handleMouseUpHandler = () => {

            if(boardState.toolActionType == "DRAWING"){

                dispatchBoardAction({ type: "SAVE_HISTORY", payload: {} });
                dispatchBoardAction({ type: "DRAW_UP", payload: {} });


            }else if(boardState.toolActionType == "ERASING"){
                dispatchBoardAction({ type: "CHANGE_TOOL_ACTION_TYPE", payload: { toolActionType: "NONE" } });
            }
        }


        const textAreaBlurHandler = (text,stroke,size) => {
           
            dispatchBoardAction({ type: "CHANGE_TEXT", payload: { text: text,stroke,size } });
        }

    const value = {
        active: boardState.active,
        elements: boardState.elements,
        handleTool,
        handleMouseDownHandler,
        handleMouseMoveHandler,
        handleMouseUpHandler,
        textAreaBlurHandler,
        boardUndoHandler,
        boardRedoHandler,
        toolActionType: boardState.toolActionType
    }

    return (
        <boardContext.Provider value={value}>
            {children}
        </boardContext.Provider>
    )
}

export default BoardProvider;

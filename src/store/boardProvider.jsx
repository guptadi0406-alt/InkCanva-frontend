import { useReducer , useCallback ,useRef ,useEffect} from "react";
import boardContext from "./board-context";

import rough from "roughjs/bin/rough";
import { createElement, getSvgPathFromStroke , isPointNearElement } from "../utils/element";
import getStroke from "perfect-freehand";
import {updateCanvasData, SOCKET_URL} from "../utils/api";
import { io } from "socket.io-client";


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
                                                if (!Elements[index]) return state;
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
                                if (!Elements[index]) return state;
                                const points = Array.isArray(Elements[index].points) ? Elements[index].points : [];
                                const updatedElement = {
                                    ...Elements[index],
                                    points: [...points, { x: clientX, y: clientY }],
                                    path: new Path2D(getSvgPathFromStroke(getStroke([...points, { x: clientX, y: clientY }], { size: Number(action.payload.size) }))),
                             
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

        case "SET_USER_LOGIN_STATUS":
            {
               return {
                   ...state,
                   isUserLoggedIn: action.payload.isUserLoggedIn,
               }

            }

        case "SET_CANVAS_ID":
            {
                return {
                    ...state,
                    canvasId: action.payload.canvasId,
                };
            }
        case "SET_HISTORY":
            {
                 return {
                     ...state,
                     history: [action.payload.elements],
                    };
            }

        case "SET_CANVAS_ELEMENTS":
            {
                return {
                    ...state,
                    elements: action.payload.elements,
                };
            }
        case "SET_INITIAL_ELEMENTS":
            {
                return {
                    ...state,
                    elements: action.payload.elements,
                    history: [action.payload.elements], 
                };
            }

        case "SET_ELEMENTS_FROM_SOCKET":
        {
            const { elements, isFinal } = action.payload;
            const updatedElements = elements.map(el => {
                if (el.type === "brush") {
                    return {
                        ...el,
                        path: new Path2D(getSvgPathFromStroke(getStroke(el.points, { size: Number(el.size) })))
                    };
                }
                if (el.type === "text") {
                    return el;
                }
                return createElement(el.id, el.x1, el.y1, el.x2, el.y2, {
                    type: el.type,
                    stroke: el.stroke,
                    fill: el.fill,
                    size: el.size,
                });
            });
            if (isFinal) {
                return {
                    ...state,
                    elements: updatedElements,
                    history: [...state.history.slice(0, state.index + 1), updatedElements],
                    index: state.index + 1
                };
            } else {
                return {
                    ...state,
                    elements: updatedElements
                };
            }
        }

        default:
            return state;
    }
}

const isUserLoggedIn = !!localStorage.getItem("whiteboard_user_token");

const initialBoardState = {
    active: "Brush",
    elements: [],
    history:[[]],
    index:0,
    toolActionType: "NONE",
    canvasId: "",
    isUserLoggedIn: isUserLoggedIn,
}



const BoardProvider = ({children}) => {

    const [boardState, dispatchBoardAction] = useReducer(boardReducer, initialBoardState);


    const socketRef = useRef(null);

   useEffect(() => {
        
        socketRef.current = io(SOCKET_URL, {
        withCredentials: true,
        });


        if (boardState.canvasId) {
        socketRef.current.emit("join-room", boardState.canvasId);
        }

        socketRef.current.on("canvas-update", (data) => {
            dispatchBoardAction({ type: "SET_ELEMENTS_FROM_SOCKET", payload: data });
        });


        return () => {
            socketRef.current.disconnect();
        };

    },[boardState.canvasId]);

    useEffect(() => {
   
            if (
                socketRef.current && 
                boardState.canvasId && 
                (boardState.toolActionType === "DRAWING" || boardState.toolActionType === "ERASING")
            ) {
                socketRef.current.emit("canvas-update", {
                    canvasId: boardState.canvasId,
                    elements: boardState.elements,
                    isFinal: false
                });
            }
    }, [boardState.elements, boardState.canvasId, boardState.toolActionType]);



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

            const newIndex = Math.max(boardState.index - 1, 0);
            const updatedElements = boardState.history[newIndex];
            updateCanvasData(boardState.canvasId, updatedElements);

            if (socketRef.current) {
                socketRef.current.emit("canvas-update", {
                    canvasId: boardState.canvasId,
                    elements: updatedElements,
                    isFinal: true
                });
            }
        }, [boardState]);


        const boardRedoHandler = useCallback(() => {

            dispatchBoardAction({ type: "REDO", payload: {} });

            const newIndex = Math.min(boardState.index + 1, boardState.history.length - 1);
            const updatedElements = boardState.history[newIndex];
            updateCanvasData(boardState.canvasId, updatedElements);

            if (socketRef.current) {
                socketRef.current.emit("canvas-update", {
                    canvasId: boardState.canvasId,
                    elements: updatedElements,
                    isFinal: true
                });
            }

        }, [boardState]);

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

                const allelems = boardState.elements;
                const canvasId = boardState.canvasId; 
                dispatchBoardAction({ type: "SAVE_HISTORY", payload: {} });
                dispatchBoardAction({ type: "DRAW_UP", payload: {} });


                    updateCanvasData(canvasId, allelems)
                    .then((data) => {
                        console.log("Canvas updated successfully:", data);
                    })
                    .catch((error) => {
                        console.error("Error updating canvas:", error);
                    });

                if (socketRef.current) {
                    socketRef.current.emit("canvas-update", {
                        canvasId,
                        elements: allelems,
                        isFinal: true
                    });
                }

            }else if(boardState.toolActionType == "ERASING"){

                dispatchBoardAction({ type: "CHANGE_TOOL_ACTION_TYPE", payload: { toolActionType: "NONE" } });
                const canvasId = boardState.canvasId; 
                const allelems = boardState.elements;
                updateCanvasData(canvasId, allelems)
                    .then((data) => {
                        console.log("Canvas updated successfully:", data);
                    })
                    .catch((error) => {
                        console.error("Error updating canvas:", error);
                    });

                if (socketRef.current) {
                    socketRef.current.emit("canvas-update", {
                        canvasId,
                        elements: allelems,
                        isFinal: true
                    });
                }
            }
        }


        const textAreaBlurHandler = (text, stroke, size) => {
            dispatchBoardAction({ type: "CHANGE_TEXT", payload: { text, stroke, size } });

         
            setTimeout(() => {
                const canvasId = boardState.canvasId;
                const Elements = [...boardState.elements];
                const index = Elements.length - 1;
                if (index >= 0) {
                  
                    const updatedElements = Elements.map((el, i) =>
                        i === index ? { ...el, text, stroke, size } : el
                    );
                    updateCanvasData(canvasId, updatedElements)
                        .then(() => {
                            
                            if (socketRef.current) {
                                socketRef.current.emit("canvas-update", {
                                    canvasId,
                                    elements: updatedElements,
                                    isFinal: true
                                });
                            }
                        })
                        .catch((err) => console.error("Error saving text:", err));
                }
            }, 0);
        }


        const setUserLoginStatus = (isUserLoggedIn) => {
            dispatchBoardAction({
                type: "SET_USER_LOGIN_STATUS",
                payload: {
                    isUserLoggedIn,
                },
            })
        }

        const setCanvasId = (canvasId) => {
            dispatchBoardAction({
                type: "SET_CANVAS_ID",
                payload: {
                    canvasId,
                },
                });
        }

        const setHistory = () => {
            dispatchBoardAction({
                type: "SET_HISTORY",
                payload: {
                    elements: boardState.elements,
                },
            });
        }

        const setElements = (elements) => {
            dispatchBoardAction({
                type: "SET_CANVAS_ELEMENTS",
                payload: {
                    elements,
                },
            });
        }


    const value = {
        active: boardState.active,
        elements: boardState.elements,
        canvasId: boardState.canvasId,
        handleTool,
        handleMouseDownHandler,
        handleMouseMoveHandler,
        handleMouseUpHandler,
        textAreaBlurHandler,
        boardUndoHandler,
        boardRedoHandler,
        setUserLoginStatus,
        isUserLoggedIn: boardState.isUserLoggedIn,
        toolActionType: boardState.toolActionType,
        setCanvasId, 
        setHistory,
        setElements,

    }

    return (
        <boardContext.Provider value={value}>
            {children}
        </boardContext.Provider>
    )
}

export default BoardProvider;

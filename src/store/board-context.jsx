import { createContext } from "react";


const boardContext = createContext({
    isUserLoggedIn: false,
    setUserLoginStatus: () => {},
    active:"",
    canvasId: "", 
    elements:[],
    history:[[]],
    index:0,
    toolActionType:"", 
    handleMouseDownHandler : ()=>{},
    handleMouseMoveHandler:()=>{},
    handleTool:()=>{},
    handleMouseUpHandler:()=>{},
    textAreaBlurHandler:()=>{},
    boardUndoHandler:()=>{},
    boardRedoHandler:()=>{},
    setCanvasId:()=>{},
    setHistory:()=>{},
    setElements:()=>{},
});

export default boardContext;
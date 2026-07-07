import { createContext } from "react";


const boardContext = createContext({
    active:"",
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
    boardRedoHandler:()=>{}
});

export default boardContext;
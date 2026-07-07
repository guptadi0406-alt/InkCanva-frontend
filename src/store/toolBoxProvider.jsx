import { useReducer } from "react";
import toolboxContext from "./toolboxContext";
import { COLORS } from "../constant";


const toolBoxReducer = (state, action) => {

    switch (action.type) {
        case "CHANGE_STROKE":
            {
                const { tool, stroke } = action.payload;
                return {
                    ...state,
                    [tool]: {
                        ...state[tool],
                        color: stroke,
                    },
                };
            }

        case "CHANGE_FILL":
            {
                const { tool, fill } = action.payload;
                return {
                    ...state,
                    [tool]: {
                        ...state[tool],
                        fill: fill,
                    },
                };
            }

        case "CHANGE_SIZE":
            {
                const { tool, size } = action.payload;
                console.log(action.payload);
                return {
                    ...state,
                    [tool]: {
                        ...state[tool],
                        size: size,
                    },
                };
            }
            
    
        default:
            return state;
    }
}



const initialState = {

    ["Line"]:{
        color: COLORS.BLACK,
        size: 1,
    },
    ["Rectangle"]:{
        color: COLORS.BLACK,
        fill: COLORS.WHITE,
        size: 1,
    },
    ["Ellipse"]:{
        color: COLORS.BLACK,
       fill: COLORS.WHITE,
        size: 1,
    },
    ["Arrow"]:{
        color: COLORS.BLACK,
        size: 1,
    },
    ["Brush"]:{
        color: COLORS.BLACK,
        size: 5,
    },
    ["Text"]:{
        color: COLORS.BLACK,
        size: 16,
    },
  

}

const ToolBoxProvider = ({ children }) => {
   const [toolBoxState, dispatchToolBoxState] = useReducer(toolBoxReducer, initialState);

   const changeStrokeHandler = (tool,stroke) => {
    
       dispatchToolBoxState({ type: "CHANGE_STROKE", payload: { tool, stroke } });
   };
   

   const changeFillHandler = (tool,fill) => {
         dispatchToolBoxState({ type: "CHANGE_FILL", payload: { tool, fill } });
   }

   const changeSizeHandler = (tool,size)=>{
    dispatchToolBoxState({ type: "CHANGE_SIZE", payload: { tool, size } });
   }

   const toolBoxValue={
        toolBoxState,
       changeStrokeHandler,
       changeFillHandler,
       changeSizeHandler
   }
    return (
        <toolboxContext.Provider value={toolBoxValue}>
            {children}
        </toolboxContext.Provider>
    )
}

export default ToolBoxProvider;

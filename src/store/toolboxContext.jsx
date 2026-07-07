import { createContext } from "react";


const toolboxContext = createContext({
   toolBoxState: {},
   changeStrokeHandler: () => {},
   changeFillHandler: () => {},
   changeSizeHandler : ()=>{}
});

export default toolboxContext;

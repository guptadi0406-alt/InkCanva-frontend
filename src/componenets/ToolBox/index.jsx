
import classes from './index.module.css'
import { COLORS } from '../../constant';
import { useContext } from 'react';
import boardContext from '../../store/board-context';
import toolboxContext from '../../store/toolboxContext';
import {FILL_TOOL_TYPES,STROKE_TOOL_TYPES,SIZE_TOOL_TYPES} from '../../constant';
import cx from 'classnames'
const ToolBox = () => {

    const {active} = useContext(boardContext);
    const {toolBoxState,changeStrokeHandler,changeFillHandler,changeSizeHandler} = useContext(toolboxContext);

    const strokeColor = toolBoxState[active]?.color ; 
    const fillColor = toolBoxState[active]?.fill ; 

    const size = toolBoxState[active]?.size;
    




  return (



    <>
        <div className={classes.container}>
             
           { STROKE_TOOL_TYPES.includes(active) &&
            
          
                <div>
                    <div className={classes.selectOptionContainer}>

                      <div className={classes.toolBoxLabel}>Stroke Color</div>

                        <div className={classes.colorsContainer}>

                          <div>
                            <input type="color" className={classes.colorPicker} value={strokeColor} onChange={(e) => changeStrokeHandler(active, e.target.value)} />
                          </div>
                                {
                                    Object.keys(COLORS).map((color, index) => {
                                        return (
                                            <div key={index} className={cx(classes.colorBox,{[classes.activeColorBox]: strokeColor === COLORS[color]})}  onClick={() => changeStrokeHandler(active,COLORS[color])} style={{ backgroundColor: COLORS[color] }}></div>
                                        )
                                    }
                                    )
                                }
                    

                      </div>
                    </div>
                </div>
         
             }

          { FILL_TOOL_TYPES.includes(active) && <div>
                <div className={classes.selectOptionContainer}>

                  <div className={classes.toolBoxLabel}>Fill Color</div>

                    <div className={classes.colorsContainer}>
                          <div>
                            <input type="color" className={classes.colorPicker} value={fillColor} onChange={(e) => changeFillHandler(active, e.target.value)} />
                          </div>
                            {
                                Object.keys(COLORS).map((color, index) => {
                                    return (
                                        <div key={index} className={cx(classes.colorBox,{[classes.activeColorBox]: fillColor === COLORS[color]})}  onClick={() => changeFillHandler(active,COLORS[color])} style={{ backgroundColor: COLORS[color] }}></div>
                                    )
                                }
                                )
                            }
                

                    </div>
                  </div>
              </div>
            }

            {SIZE_TOOL_TYPES.includes(active) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>
            {active === "Text" ? "Font Size" : "Brush Size"}
          </div>
          <input
            type="range"
            min={active === "Text" ? 12 : 1}
            max={active === "Text" ? 64 : 10}
            step={1}
            value={size}
            onChange={(event) => changeSizeHandler(active, event.target.value)}
          ></input>
        </div>
      )}



        </div>
    </>
  )
}

export default ToolBox;
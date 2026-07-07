import classes from './index.module.css'
import cx from 'classnames'
import {  useContext } from 'react'
import { MdOutlineRectangle } from "react-icons/md";
import { IoBrush } from "react-icons/io5";
import { FaSlash } from "react-icons/fa";
import { GoCircle } from "react-icons/go";
import { LuEraser } from "react-icons/lu";
import { MdFormatColorText } from "react-icons/md";
import boardContext from '../../store/board-context';
import { FaArrowRight } from "react-icons/fa6";
import { FaRedo } from "react-icons/fa";

import { FaUndo } from "react-icons/fa";

import { FaDownload } from "react-icons/fa6";
const ToolBox = () => {

  const {active} = useContext(boardContext);
  const {handleTool,boardUndoHandler,boardRedoHandler}=useContext(boardContext)

  const handleDownloadClick=()=>{

    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    const data = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = data;
    link.download = "canvas.png";
    link.click();

  }
 
  return (
    <>
    <div className={classes.container}>
      <div className={cx(classes.toolItem, {[classes.active]: active === "Brush"})} onClick={() => handleTool("Brush")}><IoBrush/></div>
      <div className={cx(classes.toolItem, {[classes.active]: active === "Line"})} onClick={() => handleTool("Line")}><FaSlash/></div>
      <div className={cx(classes.toolItem, {[classes.active]: active === "Rectangle"})} onClick={() => handleTool("Rectangle")}><MdOutlineRectangle /></div>
      <div className={cx(classes.toolItem, {[classes.active]: active === "Ellipse"})} onClick={() => handleTool("Ellipse")}><GoCircle /></div>
      <div className={cx(classes.toolItem, {[classes.active]: active === "Arrow"})} onClick={() => handleTool("Arrow")}><FaArrowRight /></div>
     
      <div className={cx(classes.toolItem, {[classes.active]: active === "Text"})} onClick={() => handleTool("Text")}><MdFormatColorText /></div>
      <div className={cx(classes.toolItem, {[classes.active]: active === "Eraser"})} onClick={() => handleTool("Eraser")}><LuEraser /></div>
      <div className={cx(classes.toolItem )} onClick={() => boardUndoHandler()}><FaUndo /></div>
      <div className={cx(classes.toolItem )} onClick={() => boardRedoHandler()}><FaRedo /></div>
      <div className={cx(classes.toolItem )} onClick={() => {handleDownloadClick()}}><FaDownload /></div>

    </div>
    </>
  )
}

export default ToolBox
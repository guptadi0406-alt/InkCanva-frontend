import  { useContext ,useEffect} from 'react'

import { useNavigate } from "react-router";
import Board from "./componenets/Board";
import ToolBar from "./componenets/ToolBar";

import ToolBoxProvider from "./store/toolBoxProvider";
import ToolBox from "./componenets/ToolBox";
import Sidebar from './componenets/Sidebar';
import boardContext from './store/board-context';
import { useParams } from 'react-router-dom';
import {fetchInitialCanvasElements, isTokenExpired} from './utils/api';
import { createElement, getSvgPathFromStroke } from './utils/element';
import getStroke from 'perfect-freehand';

// Reconstruct elements from plain DB JSON back into drawable objects
const reconstructElement = (el) => {
    if (el.type === 'brush') {
        // Rebuild Path2D from saved points
        return {
            ...el,
            path: new Path2D(getSvgPathFromStroke(getStroke(el.points, { size: Number(el.size) }))),
        };
    }
    if (el.type === 'text') {
        // Text elements don't need roughElement
        return el;
    }
    // For line, rectangle, ellipse, arrow — recreate roughElement
    return createElement(el.id, el.x1, el.y1, el.x2, el.y2, {
        type: el.type,
        stroke: el.stroke,
        fill: el.fill,
        size: el.size,
    });
};

const HomePage = () => {

    const { isUserLoggedIn, setUserLoginStatus, setCanvasId, setElements } = useContext(boardContext);
    const {id} = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        if (!isUserLoggedIn) {
            navigate("/login");
        } else if (isTokenExpired()) {
            localStorage.removeItem("whiteboard_user_token");
            setUserLoginStatus(false);
            navigate("/login");
        }
    }, [isUserLoggedIn, setUserLoginStatus, navigate]);

    useEffect(() => {
        if (id) {
            setCanvasId(id);
            fetchInitialCanvasElements(id).then((elements) => {
                if (elements && elements.length > 0) {
                    const reconstructed = elements.map(reconstructElement);
                    setElements(reconstructed);
                }
            });
        }
    }, [id]);

    
  return (
    <>

        <ToolBoxProvider>
             <div className="app-container">
                <ToolBar />
                <Board  id={id}/>
                <ToolBox />
                <Sidebar/>
             </div>
        </ToolBoxProvider>

    </>
  )
}

export default HomePage
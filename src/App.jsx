
import Board from "./componenets/Board";
import ToolBar from "./componenets/ToolBar";
import BoardProvider from "./store/boardProvider";
import ToolBoxProvider from "./store/toolBoxProvider";
import ToolBox from "./componenets/ToolBox";
function App() {

 
  return (
    <>
    <BoardProvider>
      <ToolBoxProvider>
        <ToolBar />
        <Board />
        <ToolBox />
      </ToolBoxProvider>
    </BoardProvider>
    </>
  )
}

export default App

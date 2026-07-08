import BoardProvider from "./store/boardProvider";

import HomePage from "./HomePage";
import Register from "./componenets/Register";
import Login from "./componenets/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {

 
  return (
    <>
    <BoardProvider>

       <Router>
          <Routes>

            <Route path="/" element={<HomePage />} />
            <Route path="/:id" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />


          </Routes>
      </Router>
      </BoardProvider>
    </>
  )
}

export default App

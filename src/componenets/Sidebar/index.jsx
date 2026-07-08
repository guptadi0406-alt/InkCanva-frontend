import { useState, useEffect, useContext, useRef } from 'react';
import './index.min.css';
import { useNavigate } from 'react-router-dom';
import boardContext  from '../../store/board-context';
import { useParams } from 'react-router-dom';
import {api, isTokenExpired} from '../../utils/api';


const Sidebar = () => {
  const isCreatingRef = useRef(false);
  const [canvases, setCanvases] = useState([]);
  const {canvasId,isUserLoggedIn, setUserLoginStatus,setCanvasId} = useContext(boardContext);
  const { id } = useParams();
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  
  const navigate = useNavigate();
  
  const handleCanvasClick = async (id) => {
    setCanvasId(id);
    navigate(`/${id}`);
  }
  
  useEffect(() => {
    if (id) {
      setCanvasId(id);
    }
    
  }, [id]);
  
  const handleCreateCanvas = async () => {
      if (isCreatingRef.current) return null;
      isCreatingRef.current = true;
      const token = localStorage.getItem('whiteboard_user_token');
      try {
        const response = await api.post('/canvas/createcanvas', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(response.data.canvas);
        fetchCanvases();
        setCanvasId(response.data.canvas._id);
        handleCanvasClick(response.data.canvas._id);
        return response.data.canvas;
      } catch (error) {
        console.error("Error fetching canvases:", error);
        return null;
      } finally {
        isCreatingRef.current = false;
      }

  }



   const fetchCanvases = async () => {
      // Auto-logout if token is expired
      if (isTokenExpired()) {
          localStorage.removeItem('whiteboard_user_token');
          setUserLoginStatus(false);
          navigate('/login');
          return;
      }
      const token = localStorage.getItem('whiteboard_user_token');
      try{

         const response = await api.get('/canvas/getcanvas', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const canvasList = response.data.canvases || [];
      setCanvases(canvasList);
    

      if (canvasList.length === 0) {
          const newCanvas = await handleCreateCanvas();
          if (newCanvas) {
            setCanvasId(newCanvas._id);
            handleCanvasClick(newCanvas._id);
          }
        }
      } catch (error) {
        console.error('Error fetching canvases:', error);
      }
  }




  useEffect(() => {
    if (isUserLoggedIn) {
        fetchCanvases();
    }
  }, [isUserLoggedIn]);

  useEffect(() => {}, []);

   


  

  const handleDeleteCanvas = async (canvasToDeleteId) => {
    const token = localStorage.getItem('whiteboard_user_token');
    try {
      await api.delete(`/canvas/deletecanvas/${canvasToDeleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const remaining = canvases.filter(c => c._id !== canvasToDeleteId);
      setCanvases(remaining);
      if (remaining.length > 0) {
        setCanvasId(remaining[0]._id);
        handleCanvasClick(remaining[0]._id);
      } else {
        setCanvasId("");
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting canvas:', error);
    }
  }

 
  const handleLogout = () => {
    localStorage.removeItem('whiteboard_user_token');
    setUserLoginStatus(false);
    navigate('/login');
  }

    const handleLogin = () => {
        navigate('/login');
    }

    const handleShare = async () => {
      const activeCanvasId = canvasId || id;
      const token = localStorage.getItem('whiteboard_user_token');

      if (!email.trim()) {
        setError("Please enter an email.");
        return;
      }

      if (!activeCanvasId) {
        setError("No canvas selected. Please open a canvas first.");
        return;
      }

      try {
        setError("");
        setSuccess("");

        const response = await api.put(
          `/canvas/sharecanvas/${activeCanvasId}`,
          { email },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 5000);

      } catch (error) {
        console.error('Error sharing canvas:', error);
        setError(error.response?.data?.error || "Failed to share canvas.");
      }
    }

  return (
    <>
       <div className="sidebar">
      <button 
        className="create-button" 
        onClick={handleCreateCanvas} 
        disabled={!isUserLoggedIn}
      >
        + Create New Canvas
      </button>
      <ul className="canvas-list">
        {canvases.map(canvas => (
          <li 
            key={canvas._id} 
            className={`canvas-item ${canvas._id === canvasId ? 'selected' : ''}`}
            style={{cursor: isUserLoggedIn ? 'pointer' : 'not-allowed'}}
          >
            <span 
              className="canvas-name" 
              onClick={() => handleCanvasClick(canvas._id)}
            >
              {canvas._id}
            </span>
            <button className="delete-button" onClick={() => handleDeleteCanvas(canvas._id)}>
              del
            </button>
          </li>
        ))}
      </ul>
      
      <div className="share-container">
        <input
          type="email"
          placeholder="Enter the email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="share-button" onClick={handleShare} disabled={!isUserLoggedIn}>
          Share
        </button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
    </div>
      {isUserLoggedIn ? (
        <button className="auth-button logout-button" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <button className="auth-button login-button" onClick={handleLogin}>
          Login
        </button>
      )}
    </div>
    
    </>
  )
}

export default Sidebar
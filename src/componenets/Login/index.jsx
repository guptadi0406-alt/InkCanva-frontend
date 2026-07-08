
import { useState,useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './index.module.css';
import boardContext from '../../store/board-context';
import { useEffect } from 'react';

import { api } from '../../utils/api';

const Login = () => {
    
    const { isUserLoggedIn,setUserLoginStatus } = useContext(boardContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    

    useEffect (() => {
        if (isUserLoggedIn) {
            navigate('/');
        }
    }, [isUserLoggedIn, navigate]);

    const handleSubmit = async (e) => {

        e.preventDefault();

        try{


            const response = await api.post('/users/login', { email, password });

            if (response.status === 200) {
                const data = response.data;
                localStorage.setItem('whiteboard_user_token', data.token);
                alert('Login successful!');
                setUserLoginStatus(true);
                navigate('/');
            }else {
                alert('Login failed');
            }

        }catch(e){
             console.error('Login error:', e);
            alert('An error occurred during login');
        }
    }

  return (
    <>
      <div className={styles.loginContainer}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
    </>
  )
}

export default Login
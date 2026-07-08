
import { useState ,useContext,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import styles from './index.module.css';

import boardContext from "../../store/board-context";

import { api } from '../../utils/api';

const Register = () => {
    const { isUserLoggedIn,setUserLoginStatus } = useContext(boardContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    useEffect (() => {
        if (isUserLoggedIn) {
            navigate('/');
        }
    }, [isUserLoggedIn, navigate]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
        alert("Passwords don't match");
        return;
        }

        try {

            const response = await api.post('/users/signUp', { email, password });


            if (response.status === 201) {
                const data = response.data;
        
                localStorage.setItem('whiteboard_user_token', data.token);
                alert('Registration successful! ');
                setUserLoginStatus(true);
                navigate('/');

            } else {
                
                alert('An error occurred during registration');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        }

    }

  return (
    <>
      <div className={styles.registerContainer}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className={styles.registerForm}>
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
    </>
  )
}

export default Register
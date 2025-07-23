import { FC, useState } from 'react';
import { useLogin } from '../../utils/useLogin';
import { LoginResponse } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { decodeJWT } from '../../utils';
import './styles.scss';

const Login: FC = () => {
  const {
    setUserSession,
    setUser,
  } = useAppStore((state) => state)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin((data: LoginResponse) => {
    alert('Login successful, Wellcome');
    setUserSession(data.accessToken);
    console.log("Login successful", data);
    const user = decodeJWT(data.accessToken);
    if (user && user instanceof Object) {
      setUser(user);
    }

  }, (error) => {
    alert(error?.message || 'Login failed!');
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate({ email, password })
  };

  return (
    <div className="login-layout">
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loginMutation.isPending}>Login</button>
      </form>
    </div>
  );
};

export default Login;


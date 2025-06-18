import React from 'react';

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  loginError,
  loading,
  onLogin
}) => {
  return (
    <div>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password123"
        />
      </div>

      {loginError && (
        <div className="alert alert-danger" role="alert">
          {loginError}
        </div>
      )}

      <button
        onClick={onLogin}
        className="btn btn-primary w-100"
        disabled={loading || !email || !password}
      >
        {loading ? 'Logging in...' : 'Login & Start Sync'}
      </button>
    </div>
  );
};

export default LoginForm;

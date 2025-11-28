import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    identificador: '',
    contrasenaUsuario: ''
  });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.identificador || !formData.contrasenaUsuario) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    const url = 'http://localhost:8090/api/v1/Auth/login';
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      let payload;
      const text = await response.text();

      try {
        payload = text ? JSON.parse(text) : {};
      } catch (parseError) {
        payload = { message: text || 'Error en la respuesta del servidor' };
      }

      if (response.ok) {
        onLogin(payload.user || payload.data?.user, payload.token || payload.data?.token);
      } else {
        if (response.status === 401) {
          setError(payload.message || 'Credenciales inválidas. Verifica usuario/contraseña.');
        } else if (response.status === 400) {
          setError(payload.message || 'Solicitud inválida. Verifica los datos.');
        } else if (response.status === 404) {
          setError('Servicio no encontrado. Verifica que el servidor esté corriendo.');
        } else if (response.status === 500) {
          setError(payload.message || 'Error interno del servidor.');
        } else {
          setError(payload.message || `Error del servidor (${response.status}). Intenta más tarde.`);
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setError('Error de conexión. Verifica que el servidor esté corriendo en http://localhost:8090');
        } else {
          setError('Error de conexión. Por favor, intenta nuevamente.');
        }
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (!registerData.fullName || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!registerData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    console.log('Datos de registro:', registerData);
    setError('');
    alert('Registro exitoso (simulación)');
  };

  return (
    <div className="login-container">
      {isLoginView ? (
        // Vista de inicio de sesión
        <div className="login-layout">

          {/* Panel izquierdo */}
          <div className="left-panel">
            <div className="left-content">
              <h2>¡Hola!<br />Bienvenido de nuevo</h2>
              <p>Inicia sesión para continuar</p>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="right-panel">
            <div className="login-card">
              <h1 className="card-title">Iniciar sesión</h1>
              <p className="card-subtitle">Ingresa tus credenciales</p>

              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="identificador" className="form-label">Usuario</label>
                  <input
                    id="identificador"
                    type="text"
                    name="identificador"
                    placeholder="Ingresa tu usuario"
                    className="form-input"
                    value={formData.identificador}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contrasenaUsuario" className="form-label">Contraseña</label>
                  <div className="password-wrapper">
                    <input
                      id="contrasenaUsuario"
                      type={showPassword ? 'text' : 'password'}
                      name="contrasenaUsuario"
                      placeholder="Ingresa tu contraseña"
                      className="form-input"
                      value={formData.contrasenaUsuario}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      onClick={() => setShowPassword(prev => !prev)}
                      className="toggle-password-btn"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="error-message" role="alert">
                    {error}
                  </div>
                )}

                <div className="forgot-password">
                  <a href="/recuperar-contraseña" className="forgot-link">¿Olvidaste tu contraseña?</a>
                </div>

                <button
                  type="submit"
                  className={`login-button ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Iniciando...' : 'Entrar'}
                </button>

                <div className="signup-section">
                  <span>¿No tienes cuenta? </span>
                  <button
                    type="button"
                    className="signup-link"
                    onClick={() => setIsLoginView(false)}
                  >
                    Regístrate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        // Vista de registro
        <div className="register-container">
          <div className="register-card">
            <div className="register-header">
              <h2 className="register-title">Crear cuenta</h2>
              <div className="register-subtitle">Únete hoy</div>
            </div>

            <form className="register-form" onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Nombre completo</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="Ingresa tu nombre completo"
                  className="form-input"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Ingresa tu correo"
                  className="form-input"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="registerPassword" className="form-label">Contraseña</label>
                <div className="password-wrapper">
                  <input
                    id="registerPassword"
                    type={showRegisterPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Crea una contraseña"
                    className="form-input"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showRegisterPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setShowRegisterPassword(prev => !prev)}
                    className="toggle-password-btn"
                  >
                    {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
                <div className="password-wrapper">
                  <input
                    id="confirmPassword"
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirma tu contraseña"
                    className="form-input"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showRegisterConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setShowRegisterConfirmPassword(prev => !prev)}
                    className="toggle-password-btn"
                  >
                    {showRegisterConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="terms-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={registerData.acceptTerms}
                    onChange={handleRegisterChange}
                    required
                  />
                  <span className="checkmark"></span>
                  Acepto los términos y la política de privacidad
                </label>
              </div>

              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}

              <button type="submit" className="register-button">
                Crear cuenta
              </button>

              <div className="login-section">
                <span>¿Ya tienes cuenta? </span>
                <button
                  type="button"
                  className="login-link"
                  onClick={() => setIsLoginView(true)}
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default Login;

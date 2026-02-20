import { useEffect, useState } from 'react';

const TikTokDetector = () => {
  const [isSocialBrowser, setIsSocialBrowser] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isSocial = ua.includes("TikTok") || ua.includes("Instagram") || ua.includes("FBAN") || ua.includes("FBAV");
    setIsSocialBrowser(isSocial);
  }, []);

  // Si no es un navegador de redes sociales o si el usuario cerró el cartel, no mostramos nada
  if (!isSocialBrowser || closed) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)', // El efecto de desenfoque
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo semi-transparente
      fontFamily: 'sans-serif', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#111', 
        border: '2px solid #ff0050', 
        padding: '30px', 
        borderRadius: '20px', 
        maxWidth: '400px', 
        textAlign: 'center',
        boxShadow: '0 0 20px rgba(255, 0, 80, 0.5)',
        color: 'white'
      }}>
        <h2 style={{ color: '#ff0050', marginBottom: '15px', textTransform: 'uppercase' }}>
          ¡Bienvenido al Universo Bayekverse!
        </h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' }}>
          Para poder iniciar sesión y disfrutar de <b>Punto Zero</b> sin errores de Google, necesitamos que salgas del navegador de TikTok.
        </p>

        <div style={{ 
          backgroundColor: '#222', 
          padding: '15px', 
          borderRadius: '10px', 
          textAlign: 'left',
          fontSize: '14px',
          marginBottom: '25px',
          borderLeft: '4px solid #ff0050'
        }}>
          <b>Seguí estos pasos:</b><br/>
          1. Tocá los <b>tres puntitos (⋮ o ...)</b> arriba a la derecha.<br/>
          2. Elegí <b>"Abrir en el navegador"</b>.
        </div>

        <button 
          onClick={() => setClosed(true)}
          style={{
            backgroundColor: '#ff0050',
            color: 'white',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            transition: '0.3s'
          }}
        >
          ENTENDIDO, MOSTRAR WEB
        </button>
      </div>
    </div>
  );
};

export default TikTokDetector;
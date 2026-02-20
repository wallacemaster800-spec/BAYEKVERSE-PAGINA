import { useEffect, useState } from 'react';

const TikTokDetector = () => {
  const [isSocialBrowser, setIsSocialBrowser] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    // Log para que vos mismo veas qué dice tu celular si lo conectás a la PC
    console.log("User Agent detectado:", ua);

    // Buscamos TikTok de forma insensible a mayúsculas y otras variantes
    const isTikTok = /TikTok/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isFB = /FBAN|FBAV/i.test(ua);
    
    // Si detecta CUALQUIER cosa que no sea un navegador limpio, activamos
    if (isTikTok || isInstagram || isFB) {
      setIsSocialBrowser(true);
    }
  }, []);

  if (!isSocialBrowser || closed) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(15px)', // Más blur para que se note
      WebkitBackdropFilter: 'blur(15px)', // Soporte para Safari/iOS
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      fontFamily: 'sans-serif', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#111', 
        border: '3px solid #ff0050', 
        padding: '30px', 
        borderRadius: '20px', 
        maxWidth: '400px', 
        textAlign: 'center',
        boxShadow: '0 0 30px rgba(255, 0, 80, 0.6)',
        color: 'white'
      }}>
        <h2 style={{ color: '#ff0050', marginBottom: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          ¡ATENCIÓN SOBREVIVIENTE!
        </h2>
        
        <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' }}>
          Estás en el navegador de <b>TikTok</b>. Google bloquea el inicio de sesión aquí por seguridad.
        </p>

        <div style={{ 
          backgroundColor: '#222', 
          padding: '15px', 
          borderRadius: '10px', 
          textAlign: 'left',
          fontSize: '15px',
          marginBottom: '25px',
          borderLeft: '5px solid #ff0050'
        }}>
          <b>Para entrar al universo:</b><br/>
          1. Tocá los <b>tres puntitos (⋮ o ...)</b> arriba a la derecha.<br/>
          2. Elegí <b>"Abrir en el navegador"</b>.
        </div>

        <button 
          onClick={() => setClosed(true)}
          style={{
            backgroundColor: '#ff0050',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            boxShadow: '0 4px 10px rgba(255, 0, 80, 0.3)'
          }}
        >
          ENTENDIDO, MOSTRAR WEB
        </button>
      </div>
    </div>
  );
};

export default TikTokDetector;
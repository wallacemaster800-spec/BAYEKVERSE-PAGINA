import { useEffect, useState } from 'react';

const TikTokDetector = () => {
  // 🟢 CAMBIA ESTO A 'true' PARA PROBAR EN PC. LUEGO VOLVELO A 'false'.
  const [isSocialBrowser, setIsSocialBrowser] = useState(false); 
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    // Log para debug en consola de navegador
    console.log("SISTEMA DE DETECCIÓN BAYEKVERSE - UA:", ua);

    const isTikTok = /TikTok/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isFB = /FBAN|FBAV/i.test(ua);
    
    if (isTikTok || isInstagram || isFB) {
      setIsSocialBrowser(true);
    }
  }, []);

  if (!isSocialBrowser || closed) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(0, 0, 0, 0.9)', color: 'white',
      fontFamily: 'sans-serif', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#111', border: '3px solid #ff0050', padding: '30px',
        borderRadius: '20px', maxWidth: '450px', textAlign: 'center',
        boxShadow: '0 0 40px rgba(255, 0, 80, 0.7)'
      }}>
        <h2 style={{ color: '#ff0050', marginBottom: '15px', textTransform: 'uppercase', fontWeight: '900' }}>
          ¡ATENCIÓN SOBREVIVIENTE!
        </h2>
        
        <p style={{ fontSize: '17px', lineHeight: '1.6', marginBottom: '20px' }}>
          Estás dentro de <b>TikTok</b>. Para poder iniciar sesión con Google y comprar la serie, tenés que salir al navegador real.
        </p>

        <div style={{ 
          backgroundColor: '#222', padding: '15px', borderRadius: '10px', 
          textAlign: 'left', fontSize: '15px', marginBottom: '25px',
          borderLeft: '5px solid #ff0050', color: '#ccc'
        }}>
          <b>SEGUÍ ESTOS PASOS:</b><br/>
          1. Tocá los <b>tres puntitos (⋮ o ...)</b> arriba a la derecha.<br/>
          2. Elegí <b>"Abrir en el navegador"</b> (u Open in browser).
        </div>

        <button 
          onClick={() => setClosed(true)}
          style={{
            backgroundColor: '#ff0050', color: 'white', border: 'none',
            padding: '15px 25px', borderRadius: '50px', fontSize: '16px',
            fontWeight: 'bold', cursor: 'pointer', width: '100%',
            boxShadow: '0 4px 15px rgba(255, 0, 80, 0.4)'
          }}
        >
          ENTENDIDO, MOSTRAR WEB
        </button>
      </div>
    </div>
  );
};

export default TikTokDetector;
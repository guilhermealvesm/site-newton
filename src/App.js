import React, { useState, useEffect, useRef } from 'react';
import Letter from './Letter'; // Certifique-se que o caminho está correto para o componente Letter
import './App.css'; // Certifique-se de incluir o CSS apropriado

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    position: "relative",
    color: "#fff",
    overflow: "hidden",
    padding: "0",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  warning: {
    position: "absolute",
    top: "10%",
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontSize: "20px",
    background: "rgba(0, 0, 0, 0.7)",
    padding: "10px",
    zIndex: 10,
  },
  wordContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 3,
  },
  elipseContainer: {
    position: "absolute",
    top: "43%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 3,
  },
  elipse: {
    width: "420px",
    height: "900px",
    transform: "rotate(-6deg)",
  },
  footer: {
    position: "absolute",
    bottom: "5%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "60px",
    fontSize: "18px",
    zIndex: 3,
  },
  footerIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "60px",
  },
  footerSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: 'RightGroteskNarrowFine',
    color: "#fff",
  },
  footerText: {
    fontSize: "16px",
    marginTop: "10px",
  },
  websiteSoon: {
    fontSize: "28px",
    marginBottom: "-100px",
  },
};

function App() {
  const [positions, setPositions] = useState({});
  const [showWarning, setShowWarning] = useState(true);

  // Referências para os elementos que serão obstáculos
  const footerRef = useRef(null);
  const websiteSoonRef = useRef(null);

  // Esconder o aviso após 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowWarning(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Definir posições iniciais para cada letra
  const initialPositions = [
    { x: -20, y: -50 },
    { x: -30, y: -50 },
    { x: -30, y: -50 },
    { x: -10, y: -50 },
    { x: -20, y: -50 },
    { x: -30, y: -50 }
  ];

  return (
    <div style={styles.container}>
      {showWarning && <div style={styles.warning}>Este é um site interativo. Arraste as letras!</div>}

      {/* Elipse decorativa */}
      <div style={styles.elipseContainer}>
        <img src={`/elipse.svg`} alt="elipse" style={styles.elipse} />
      </div>

      {/* Letras interativas */}
      <div style={styles.wordContainer}>
        {['N', 'E', 'W', 'T', 'O', 'N'].map((letter, index) =>
          <Letter
            key={index}
            letter={letter}
            marginRight={index !== 5 ? '-60px' : '0px'}
            positions={positions}
            setPositions={setPositions}
            index={index}
            initialPosition={initialPositions[index]} // Posição inicial para cada letra
            idleTime={10000} // Tempo de inatividade de 10 segundos para começar a flutuar
            obstacles={[footerRef, websiteSoonRef]} // Passando referências dos obstáculos
          />
        )}
      </div>

      {/* Texto "Website Soon" */}
      <div style={styles.websiteSoon} ref={websiteSoonRef}>
        <img src="/website soon.svg" alt="website" style={{ width: '100px' }} />
      </div>

      {/* Rodapé */}
      <footer style={styles.footer} ref={footerRef}>
        <div style={styles.footerIcon}>
          <div style={styles.footerSection}>
            <img src="/contact us.svg" alt="contact us" style={{ width: '100px' }} />
            <div style={styles.footerText}>diego@newton.studio</div>
          </div>
          <div style={styles.footerSection}>
            <img src="/some works.svg" alt="some works" style={{ width: '100px' }} />
            <div style={styles.footerText}>Bē</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

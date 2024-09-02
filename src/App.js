import React, { useRef, useEffect, useState } from 'react';
import { useSpring, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

function Letter({ letter, marginRight, positions, setPositions, index, initialPosition }) {
  const [{ x, y }, api] = useSpring(() => ({ x: initialPosition.x, y: initialPosition.y }));
  const letterRef = useRef();

  useEffect(() => {
    setPositions(positions => ({ ...positions, [index]: { x: x.get(), y: y.get(), ref: letterRef } }));
  }, [x, y]);

  const bind = useDrag(({ down, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], memo = [x.get(), y.get()] }) => {
    if (down) {
      api.start({ x: mx, y: my, immediate: true });
      return memo;
    } else {
      let newX = memo[0] + vx * dx * 500;
      let newY = memo[1] + vy * dy * 500;

      // Verificar colisões
      Object.keys(positions).forEach(key => {
        if (parseInt(key) !== index) {
          const other = positions[key];
          const distance = Math.hypot(other.x - newX, other.y - newY);

          if (distance < 150) { // Ajuste aqui conforme o tamanho das letras
            const overlap = 150 - distance;
            newX += overlap * (newX - other.x) / distance;
            newY += overlap * (newY - other.y) / distance;

            // Inverte a direção para simular a colisão
            vx *= -0.5;
            vy *= -0.5;
          }
        }
      });

      // Animação de inércia com desaceleração
      api.start({
        x: newX,
        y: newY,
        immediate: false,
        config: { tension: 170, friction: 26 }
      });

      // Voltar à posição inicial após um pequeno atraso para permitir a inércia
      setTimeout(() => {
        api.start({
          x: initialPosition.x,
          y: initialPosition.y,
          immediate: false,
          config: { tension: 60, friction: 18 }
        });
      }, 1000); // 1 segundo antes de começar a voltar
    }
  }, {
    from: () => [x.get(), y.get()],
    rubberband: 0.2
  });

  return (
    <animated.span
      {...bind()}
      ref={letterRef}
      style={{
        display: 'inline-block',
        position: 'relative',
        width: '150px',
        height: '200px',
        marginRight,
        touchAction: 'none',
        transform: interpolate([x, y], (x, y) => `translate3d(${x}px, ${y}px, 0)`),
        zIndex: 2,
      }}
    >
      <img
        src={`/${letter}.svg`}
        alt={letter}
        style={{ width: '100%', height: '100%' }}
      />
    </animated.span>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#000",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    padding: "0px 0",
  },
  contentContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
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
    top: "40%", // Abaixa a parte superior da elipse
    left: "48%",
    transform: "translate(-50%, -50%)",
    zIndex: 1,
  },
  elipse: {
    width: "470px",
    height: "900px",
    transform: "rotate(-6deg, 15deg)", // Ajuste o ângulo para deitar mais a elipse
  },
  footer: {
    position: "absolute",
    bottom: "5%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "60px", // Ajuste aqui a distância entre as seções
    fontSize: "18px",
    zIndex: 3,
  },
  footerSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: 'RightGroteskNarrowFine', // Aplicando a fonte no footer
  },
  footerTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "8px",
    fontFamily: 'RightGroteskTightBlack', // Aplicando a segunda fonte no título
  },
  footerLink: {
    fontSize: "16px",
    fontFamily: 'RightGroteskNarrowFine', // Aplicando a fonte nos links
  },
  websiteSoon: {
    fontSize: "28px", // Aumenta o tamanho da fonte
    marginBottom: "-100px", // Move para cima com margem inferior negativa
  },
};

function App() {
  const [positions, setPositions] = useState({});

  // Definir posições iniciais para cada letra
  const initialPositions = [
    { x: -20, y: 0 },
    { x: -30, y: 0 },
    { x: -30, y: 0 },
    { x: -10, y: 0 },
    { x: -20, y: 0 },
    { x: -20, y: 0 }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.elipseContainer}>
        <img src={`/elipse.svg`} alt="elipse" style={styles.elipse} />
      </div>
      <div style={styles.contentContainer}>
        <div id="newton" style={styles.wordContainer}>
          {['N', 'E', 'W', 'T', 'O', 'N'].map((letter, index) =>
            <Letter
              key={index}
              letter={letter}
              marginRight={index !== 5 ? '-30px' : '0px'}
              positions={positions}
              setPositions={setPositions}
              index={index}
              initialPosition={initialPositions[index]} // Posição inicial para cada letra
            />
          )}
        </div>
        <div style={styles.websiteSoon}>website soon</div> {/* Adiciona o texto do website soon aqui */}
      </div>
      <footer style={styles.footer}>
        <div style={styles.footerSection}>
          <div style={styles.footerTitle}>contact us:</div>
          <div style={styles.footerLink}>diego@newton.studio</div>
        </div>
        <div style={styles.footerSection}>
          <div style={styles.footerTitle}>some works</div>
          <div style={styles.footerLink}>Bē</div>
        </div>
      </footer>
    </div>
  );
}

export default App;

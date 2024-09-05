import React, { useRef, useEffect, useState } from 'react';
import { useSpring, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

function Letter({ letter, marginRight, positions, setPositions, index, initialPosition }) {
  const [{ x, y, rotate }, api] = useSpring(() => ({
    x: initialPosition.x,
    y: initialPosition.y,
    rotate: 0,
  }));
  const letterRef = useRef();
  const velocity = useRef({ x: 0, y: 0 }); // Velocidade inicial
  const size = 150; // Tamanho estimado das letras para colisão

  useEffect(() => {
    setPositions(positions => ({ ...positions, [index]: { x: x.get(), y: y.get(), ref: letterRef } }));

    const inertiaInterval = setInterval(() => {
      if (!letterRef.current) return;

      // Aplicar a inércia e atualizar a posição e rotação
      api.start({
        x: x.get() + velocity.current.x,
        y: y.get() + velocity.current.y,
        rotate: rotate.get() + velocity.current.x * 0.5, // Rotaciona conforme o movimento
        immediate: false,
        config: { tension: 100, friction: 20 }
      });

      // Verificar colisões e ajustar posição
      handleCollisions();

      // Limitar para que as letras não saiam da tela
      if (y.get() > window.innerHeight - size) { // Limite inferior
        velocity.current.y *= -0.9; // Rebote na borda inferior
        api.start({
          y: window.innerHeight - size,
          immediate: true
        });
      }

      if (y.get() < 0) { // Limite superior corrigido
        velocity.current.y *= -0.9; // Rebote no topo
        api.start({
          y: 0,
          immediate: true
        });
      }

      if (x.get() < 0 || x.get() > window.innerWidth - size) {
        velocity.current.x *= -0.9; // Rebote nas bordas laterais
        api.start({
          x: Math.min(Math.max(x.get(), 0), window.innerWidth - size),
          immediate: true
        });
      }
    }, 1000 / 60); // 60 frames por segundo

    return () => clearInterval(inertiaInterval);
  }, [x, y]);

  // Função para verificar e tratar colisões entre letras
  const handleCollisions = () => {
    Object.keys(positions).forEach(key => {
      if (parseInt(key) !== index) {
        const other = positions[key];
        const distance = Math.hypot(other.x - x.get(), other.y - y.get());

        if (distance < size) { // Quando a distância é menor que o tamanho das letras
          const angle = Math.atan2(y.get() - other.y, x.get() - other.x);

          // Calcular nova direção após colisão (rebate em direções opostas)
          const overlap = size - distance; // Tamanho da sobreposição
          velocity.current.x = (velocity.current.x * 0.9) + (other.x - x.get()) * 0.1; // Inverter e suavizar a direção no eixo X
          velocity.current.y = (velocity.current.y * 0.9) + (other.y - y.get()) * 0.1; // Inverter e suavizar a direção no eixo Y

          // Ajustar as posições para evitar sobreposição
          api.start({
            x: x.get() + Math.cos(angle) * overlap,
            y: y.get() + Math.sin(angle) * overlap,
            immediate: true
          });

          // Ajustar a posição do outro objeto (other) para também rebater
          positions[key].ref.current.style.transform = `translate3d(${other.x + Math.cos(angle) * -overlap}px, ${other.y + Math.sin(angle) * -overlap}px, 0)`;
        }
      }
    });
  };

  const bind = useDrag(({ down, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], memo = [x.get(), y.get()] }) => {
    if (down) {
      api.start({ x: memo[0] + mx, y: memo[1] + my, immediate: true });
      return memo;
    } else {
      // Aplicar velocidade com base na direção do arrasto e soltar
      velocity.current.x = vx * dx * 10; // Aplicar a velocidade X
      velocity.current.y = vy * dy * 10; // Aplicar a velocidade Y

      let newX = memo[0] + velocity.current.x;
      let newY = memo[1] + velocity.current.y;

      // Verificar colisões e ajustar a posição
      handleCollisions();

      // Aplicar inércia e desaceleração
      api.start({
        x: newX,
        y: newY,
        immediate: false,
        config: { tension: 120, friction: 20 }
      });
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
        width: `${size}px`,
        height: `${size}px`,
        marginRight,
        touchAction: 'none',
        transform: interpolate([x, y, rotate], (x, y, rotate) => `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`),
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
    transform: "rotate(-6deg)", // Ajuste o ângulo para deitar mais a elipse
  },
  footer: {
    position: "absolute",
    bottom: "5%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "60px", // Ajuste o espaçamento entre os ícones
    fontSize: "18px",
    zIndex: 3,
  },
  footerIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "60px", // Espaçamento entre os ícones
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
    marginTop: "10px", // Espaçamento abaixo dos ícones
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
    { x: -40, y: 0 },
    { x: -40, y: 0 }
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
        <div style={styles.websiteSoon}>
          <img src="/website soon.svg" alt="website" style={{ width: '100px' }} />
        </div> {/* Adiciona o texto do website soon aqui */}
      </div>
      <footer style={styles.footer}>
        <div style={styles.footerIcon}>
          {/* Adicionando os SVGs no lugar do texto */}
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

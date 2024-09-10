import React, { useRef, useEffect, useState } from 'react';
import { useSpring, animated, to as interpolate } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

function Letter({ letter, marginRight, positions, setPositions, index, initialPosition, obstacles }) {
  const [{ x, y, rotate }, api] = useSpring(() => ({
    x: initialPosition.x,
    y: initialPosition.y,
    rotate: 0,
  }));
  const letterRef = useRef();
  const velocity = useRef({ x: 0, y: 0 }); // Velocidade inicial
  const friction = 0.98; // Desaceleração para inércia
  const size = 150; // Tamanho estimado das letras para colisão
  const returnForce = 0.03; // A força com que as letras voltam à posição inicial

  useEffect(() => {
    setPositions(positions => ({ ...positions, [index]: { x: x.get(), y: y.get(), ref: letterRef } }));

    const inertiaInterval = setInterval(() => {
      if (!letterRef.current) return;

      // Aplicar inércia contínua (fricção)
      velocity.current.x *= friction;
      velocity.current.y *= friction;

      const distanceFromInitialX = initialPosition.x - x.get();
      const distanceFromInitialY = initialPosition.y - y.get();

      if (Math.abs(velocity.current.x) < 0.5 && Math.abs(velocity.current.y) < 0.5) {
        velocity.current.x += distanceFromInitialX * returnForce;
        velocity.current.y += distanceFromInitialY * returnForce;
      }

      // Verificar colisões com obstáculos (footer e websiteSoon)
      obstacles.forEach(obstacle => {
        if (obstacle.current) {
          const obstacleRect = obstacle.current.getBoundingClientRect();
          const letterRect = letterRef.current.getBoundingClientRect();

          if (
            letterRect.right > obstacleRect.left &&
            letterRect.left < obstacleRect.right &&
            letterRect.bottom > obstacleRect.top &&
            letterRect.top < obstacleRect.bottom
          ) {
            // Ajustar a direção da letra (rebate)
            velocity.current.x = -velocity.current.x * 0.8; // Rebater no eixo X
            velocity.current.y = -velocity.current.y * 0.8; // Rebater no eixo Y
          }
        }
      });

      api.start({
        x: x.get() + velocity.current.x,
        y: y.get() + velocity.current.y,
        rotate: rotate.get() + velocity.current.x * 0.5,
        immediate: true,
      });

      // Verificar colisões entre as letras
      handleCollisions();
    }, 1000 / 60);

    return () => clearInterval(inertiaInterval);
  }, [x, y]);

  const handleCollisions = () => {
    Object.keys(positions).forEach(key => {
      if (parseInt(key) !== index) {
        const other = positions[key];
        const distance = Math.hypot(other.x - x.get(), other.y - y.get());

        if (distance < size) {
          const angle = Math.atan2(y.get() - other.y, x.get() - other.x);
          const overlap = size - distance;
          const forceFactor = 0.05;

          velocity.current.x += Math.cos(angle) * overlap * forceFactor;
          velocity.current.y += Math.sin(angle) * overlap * forceFactor;

          api.start({
            x: x.get() + Math.cos(angle) * overlap,
            y: y.get() + Math.sin(angle) * overlap,
            immediate: true,
          });

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
      velocity.current.x = vx * dx * 15;
      velocity.current.y = vy * dy * 15;

      api.start({
        x: x.get() + velocity.current.x,
        y: y.get() + velocity.current.y,
        immediate: true
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

export default Letter;

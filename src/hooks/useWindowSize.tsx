import { useLayoutEffect, useState } from 'react';
import { properties } from '../game/properties';

export function useWindowSize() {
  const { width: maxWidth, height: maxHeight, padding } = properties.canvas;
  const getWidth = () => Math.min(window.innerWidth - padding, maxWidth);
  const getHeight = () => Math.min(window.innerHeight - padding, maxHeight);

  const [size, setSize] = useState([getWidth(), getHeight()]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([getWidth(), getHeight()]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

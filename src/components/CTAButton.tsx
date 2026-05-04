import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router';

interface Props {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  external?: boolean;
  ghost?: boolean;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789→#@!?';

function useScramble(text: string) {
  const [display, setDisplay] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval>>();

  const scramble = useCallback(() => {
    clearInterval(timer.current);
    const start = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min((Date.now() - start) / 420, 1);
      const revealed = Math.floor(p * text.length);
      setDisplay(text.split('').map((c, i) =>
        c === ' ' ? ' ' : i < revealed ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join(''));
      if (p >= 1) { clearInterval(timer.current); setDisplay(text); }
    }, 38);
  }, [text]);

  const reset = useCallback(() => { clearInterval(timer.current); setDisplay(text); }, [text]);
  useEffect(() => () => clearInterval(timer.current), []);
  return { display, scramble, reset };
}

const CTAButton: React.FC<Props> = ({ children, href, onClick, className = '', external = false, ghost = false }) => {
  const text = typeof children === 'string' ? children : String(children ?? '');
  const { display, scramble, reset } = useScramble(text);
  const cls = `${ghost ? 'btn-ghost' : 'btn'} ${className}`;
  const handlers = { onMouseEnter: scramble, onMouseLeave: reset, onClick };

  if (!href) return <button type="button" className={cls} {...handlers}><span>{display}</span></button>;
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...handlers}><span>{display}</span></a>;
  return <Link to={href} className={cls} {...handlers}><span>{display}</span></Link>;
};

export default CTAButton;

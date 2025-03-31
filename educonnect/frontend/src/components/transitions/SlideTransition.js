import React from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { useLocation } from 'react-router-dom';
import './SlideTransition.css';

const SlideTransition = ({ children }) => {
  const location = useLocation();
  const nodeRef = React.useRef(null);

  return (
    <div className="transition-wrapper">
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={location.key}
          nodeRef={nodeRef}
          timeout={300}
          classNames="slide"
          unmountOnExit
        >
          <div ref={nodeRef} className="slide-container">
            {children}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
};

export default SlideTransition; 
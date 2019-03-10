import * as React from 'react';
import { CSSTransition } from 'react-transition-group';
import './Modal.scss';

interface Props {
  show: boolean;
  fullscreen?: boolean;
  children?: React.ReactNode;
}

export default function Modal(props: Props) {
  return (
    <CSSTransition
      in={props.show}
      classNames="modal"
      timeout={400}
      unmountOnExit
    >
      <div className="modal-wrapper">
        <div className={[
          "modal-content",
          props.fullscreen ? "fullscreen" : ""
        ].join(" ")}>
          {props.children}
        </div>
      </div>
    </CSSTransition>
  );
}

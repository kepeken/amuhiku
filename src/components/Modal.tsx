import * as React from 'react';
import { CSSTransition } from 'react-transition-group';
import './Modal.scss';

interface Props {
  show: boolean;
  fullscreen?: boolean;
}

export default class Modal extends React.Component<Props> {
  render() {
    return (
      <CSSTransition
        in={this.props.show}
        classNames="modal"
        timeout={400}
        unmountOnExit
      >
        <div className="modal-wrapper">
          <div className={[
            "modal-content",
            this.props.fullscreen ? "fullscreen" : ""
          ].join(" ")}>
            {this.props.children}
          </div>
        </div>
      </CSSTransition>
    );
  }
}

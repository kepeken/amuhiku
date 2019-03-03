import * as React from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';
import './Page.scss';

export class List extends React.Component<{
  children?: React.ReactNode | React.ReactNode[];
}, {
  transiting: boolean;
}> {
  public state = {
    transiting: false,
  };

  reflow(node: HTMLElement) {
    // https://github.com/reactjs/react-transition-group/blob/master/src/CSSTransition.js#L120
    node.scrollTop;
  }

  render() {
    const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children];
    return (
      <TransitionGroup className={[
        "page-list",
        this.state.transiting ? "page-transiting" : ""
      ].join(" ")} >
        {children.map((item, i) => item && (
          <Transition
            key={i}
            timeout={300}
            onEnter={() => this.setState({ transiting: true })}
            onEntering={(node) => { this.reflow(node); this.setState({ transiting: false }); }}
            onExiting={() => this.setState({ transiting: true })}
            onExited={() => this.setState({ transiting: false })}
          >
            {item}
          </Transition>
        ))}
      </TransitionGroup>
    );
  }
}

export const Item = (props: {
  children?: React.ReactNode;
}) => (
    <div className="page-item">
      {props.children}
    </div>
  );

export const Header = (props: { children?: React.ReactNode }) => (
  <div className="page-header">{props.children}</div>
);

export const Title = (props: { children?: React.ReactNode }) => (
  <div className="page-header-title">{props.children}</div>
);

export const Button = (props: {
  onClick?: () => void;
  children?: React.ReactNode;
}) => (
    <div className="page-header-button" onClick={props.onClick}>{props.children}</div>
  );

export const Body = (props: { children?: React.ReactNode }) => (
  <div className="page-body">{props.children}</div>
);

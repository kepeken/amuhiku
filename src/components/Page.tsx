import * as React from 'react';
import { Transition, TransitionGroup } from 'react-transition-group';
import './Page.scss';

function reflow(node: HTMLElement) {
  // https://github.com/reactjs/react-transition-group/blob/master/src/CSSTransition.js#L120
  node.scrollTop;
}

interface ListProps {
  children?: React.ReactNode;
}

export function List(props: ListProps) {
  const [transiting, setTransiting] = React.useState(false);

  return (
    <TransitionGroup className={[
      "page-list",
      transiting ? "page-transiting" : ""
    ].join(" ")} >
      {React.Children.map(props.children, (item, i) => item && (
        <Transition
          key={i}
          timeout={300}
          onEnter={() => setTransiting(true)}
          onEntering={node => { reflow(node); setTransiting(false); }}
          onExiting={() => setTransiting(true)}
          onExited={() => setTransiting(false)}
        >
          {item}
        </Transition>
      ))}
    </TransitionGroup>
  );
}

interface ItemProps {
  children?: React.ReactNode;
}

export const Item = (props: ItemProps) => (
  <div className="page-item">
    {props.children}
  </div>
);

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header = (props: HeaderProps) => (
  <div className="page-header">{props.children}</div>
);

interface TitleProps {
  children?: React.ReactNode;
}

export const Title = (props: TitleProps) => (
  <div className="page-header-title">{props.children}</div>
);

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const Button = (props: ButtonProps) => (
  <div
    className={"page-header-button" + (props.className ? " " + props.className : "")}
    onClick={props.onClick}>
    {props.children}
  </div>
);

interface BodyProps {
  children?: React.ReactNode;
}

export const Body = (props: BodyProps) => (
  <div className="page-body">{props.children}</div>
);

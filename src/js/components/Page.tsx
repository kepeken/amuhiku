import * as React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

export const List = (props: {
  children?: React.ReactNode;
}) => (
    <TransitionGroup className="page-list">
      {props.children}
    </TransitionGroup>
  );

export const Item = (props: {
  key?: string | number;
  children?: React.ReactNode;
}) => (
    <CSSTransition
      key={props.key}
      timeout={300}
      classNames="page"
    >
      <div className="page-item">
        {props.children}
      </div>
    </CSSTransition>
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

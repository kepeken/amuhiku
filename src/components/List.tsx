import * as React from 'react';
import './List.scss';

export const List = (props: { children?: React.ReactNode }) => (
  <div className="list">{props.children}</div>
);

export const Item = (props: {
  onClick?: () => void;
  children?: React.ReactNode;
}) => (
    <div className="list-item" onClick={props.onClick}>{props.children}</div>
  );

export const Icon = (props: { children?: React.ReactNode }) => (
  <div className="list-item-icon">{props.children}</div>
);

export const Text = (props: { children?: React.ReactNode }) => (
  <div className="list-item-text">{props.children}</div>
);

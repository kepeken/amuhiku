import * as React from 'react';
import './List.scss';

interface ListProps {
  children?: React.ReactNode;
}

export const List = (props: ListProps) => (
  <div className="list">{props.children}</div>
);

interface ItemProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

export const Item = (props: ItemProps) => (
  <div className="list-item" onClick={props.onClick}>{props.children}</div>
);

interface LinkItemProps {
  href: string;
  children?: React.ReactNode;
}

export const LinkItem = (props: LinkItemProps) => (
  <a className="list-item" href={props.href} target="_blank" rel="noopener noreferrer">{props.children}</a>
);

interface IconProps {
  children?: React.ReactNode;
}

export const Icon = (props: IconProps) => (
  <div className="list-item-icon">{props.children}</div>
);

interface TextProps {
  children?: React.ReactNode;
}

export const Text = (props: TextProps) => (
  <div className="list-item-text">{props.children}</div>
);

import * as React from "./";
export { Fragment } from "./";

export namespace JSX {
  interface Element extends React.JSX.Element {}
  interface ElementClass extends React.JSX.ElementClass {}
  interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty {}
  interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute {}
  type ElementType = React.JSX.ElementType;
  interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
  type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
  interface IntrinsicElements extends React.JSX.IntrinsicElements {}
}

export function jsx(type: React.JSX.ElementType, props: unknown, key?: React.Key): React.ReactElement;
export function jsxs(type: React.JSX.ElementType, props: unknown, key?: React.Key): React.ReactElement;

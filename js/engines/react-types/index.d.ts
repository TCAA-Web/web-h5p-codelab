// Forenklede React-typer til Code Lab (inspireret af @types/react). Kun det, begyndere har brug for.
export = React;
export as namespace React;

declare namespace React {
  // ---------- Grundtyper ----------
  type Key = string | number | bigint;
  type ReactText = string | number;
  type ReactNode =
    | ReactElement
    | string
    | number
    | bigint
    | Iterable<ReactNode>
    | boolean
    | null
    | undefined;

  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: string | null;
  }

  type JSXElementConstructor<P> = (props: P) => ReactNode;

  interface Attributes {
    key?: Key | null | undefined;
  }
  interface RefAttributes<T> extends Attributes {
    ref?: Ref<T> | undefined;
  }
  type Ref<T> = RefCallback<T> | RefObject<T> | null;
  type RefCallback<T> = (instance: T | null) => void;
  interface RefObject<T> {
    current: T | null;
  }
  interface MutableRefObject<T> {
    current: T;
  }

  type PropsWithChildren<P = unknown> = P & { children?: ReactNode | undefined };

  interface FunctionComponent<P = {}> {
    (props: P): ReactNode;
    displayName?: string | undefined;
  }
  type FC<P = {}> = FunctionComponent<P>;
  type VFC<P = {}> = FunctionComponent<P>;

  type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
    T extends JSXElementConstructor<infer P> ? P : T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] : {};

  // ---------- CSS ----------
  interface CSSProperties {
    [property: string]: string | number | undefined;
  }

  // ---------- Events ----------
  interface SyntheticEvent<T = Element, E = Event> {
    currentTarget: T;
    target: EventTarget;
    nativeEvent: E;
    preventDefault(): void;
    stopPropagation(): void;
    type: string;
  }
  interface MouseEvent<T = Element, E = globalThis.MouseEvent> extends SyntheticEvent<T, E> {
    clientX: number;
    clientY: number;
  }
  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }
  interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  interface KeyboardEvent<T = Element> extends SyntheticEvent<T, globalThis.KeyboardEvent> {
    key: string;
  }
  interface FocusEvent<T = Element> extends SyntheticEvent<T, globalThis.FocusEvent> {}

  type EventHandler<E extends SyntheticEvent<any>> = { bivarianceHack(event: E): void }["bivarianceHack"];
  type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;
  type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
  type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;
  type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>;
  type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>;

  // ---------- HTML-attributter ----------
  interface DOMAttributes<T> extends RefAttributes<T> {
    children?: ReactNode | undefined;
    dangerouslySetInnerHTML?: { __html: string } | undefined;
    onClick?: MouseEventHandler<T> | undefined;
    onDoubleClick?: MouseEventHandler<T> | undefined;
    onMouseEnter?: MouseEventHandler<T> | undefined;
    onMouseLeave?: MouseEventHandler<T> | undefined;
    onChange?: ChangeEventHandler<T> | undefined;
    onInput?: FormEventHandler<T> | undefined;
    onSubmit?: FormEventHandler<T> | undefined;
    onFocus?: FocusEventHandler<T> | undefined;
    onBlur?: FocusEventHandler<T> | undefined;
    onKeyDown?: KeyboardEventHandler<T> | undefined;
    onKeyUp?: KeyboardEventHandler<T> | undefined;
  }

  interface HTMLAttributes<T> extends DOMAttributes<T> {
    className?: string | undefined;
    id?: string | undefined;
    style?: CSSProperties | undefined;
    title?: string | undefined;
    lang?: string | undefined;
    hidden?: boolean | undefined;
    tabIndex?: number | undefined;
    role?: string | undefined;
    dir?: string | undefined;
  }

  interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string | undefined;
    target?: "_blank" | "_self" | "_parent" | "_top" | (string & {}) | undefined;
    rel?: string | undefined;
    download?: any;
  }
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    src?: string | undefined;
    alt?: string | undefined;
    width?: number | string | undefined;
    height?: number | string | undefined;
    loading?: "eager" | "lazy" | undefined;
  }
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string | undefined;
    value?: string | number | readonly string[] | undefined;
    defaultValue?: string | number | readonly string[] | undefined;
    checked?: boolean | undefined;
    defaultChecked?: boolean | undefined;
    placeholder?: string | undefined;
    name?: string | undefined;
    disabled?: boolean | undefined;
    required?: boolean | undefined;
    readOnly?: boolean | undefined;
    min?: number | string | undefined;
    max?: number | string | undefined;
    step?: number | string | undefined;
    maxLength?: number | undefined;
    autoFocus?: boolean | undefined;
    autoComplete?: string | undefined;
  }
  interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    htmlFor?: string | undefined;
  }
  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: "submit" | "reset" | "button" | undefined;
    disabled?: boolean | undefined;
    name?: string | undefined;
    value?: string | number | undefined;
  }
  interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    action?: string | undefined;
    method?: string | undefined;
    noValidate?: boolean | undefined;
  }
  interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | number | readonly string[] | undefined;
    defaultValue?: string | number | readonly string[] | undefined;
    placeholder?: string | undefined;
    name?: string | undefined;
    rows?: number | undefined;
    cols?: number | undefined;
    required?: boolean | undefined;
    disabled?: boolean | undefined;
    readOnly?: boolean | undefined;
  }
  interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | number | readonly string[] | undefined;
    defaultValue?: string | number | readonly string[] | undefined;
    name?: string | undefined;
    multiple?: boolean | undefined;
    required?: boolean | undefined;
    disabled?: boolean | undefined;
  }
  interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | number | undefined;
    selected?: boolean | undefined;
    disabled?: boolean | undefined;
  }
  interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
    colSpan?: number | undefined;
    rowSpan?: number | undefined;
  }
  interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
    start?: number | undefined;
    reversed?: boolean | undefined;
  }

  // ---------- Komponent-API ----------
  const Fragment: ExoticComponent<{ children?: ReactNode | undefined }>;
  interface ExoticComponent<P = {}> {
    (props: P): ReactNode;
    readonly $$typeof: symbol;
  }

  function createElement(type: string | JSXElementConstructor<any>, props?: any, ...children: ReactNode[]): ReactElement;
  function cloneElement<P>(element: ReactElement<P>, props?: Partial<P> & Attributes, ...children: ReactNode[]): ReactElement<P>;
  function isValidElement(object: {} | null | undefined): object is ReactElement;

  const Children: {
    map<T, C>(children: C | readonly C[], fn: (child: C, index: number) => T): C extends null | undefined ? C : Array<Exclude<T, boolean | null | undefined>>;
    forEach<C>(children: C | readonly C[], fn: (child: C, index: number) => void): void;
    count(children: any): number;
    only<C>(children: C): C extends any[] ? never : C;
    toArray(children: ReactNode | ReactNode[]): Array<Exclude<ReactNode, boolean | null | undefined>>;
  };

  // ---------- Hooks ----------
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
  type EffectCallback = () => void | (() => void);
  type DependencyList = readonly unknown[];

  function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  function useEffect(effect: EffectCallback, deps?: DependencyList): void;
  function useRef<T>(initialValue: T): MutableRefObject<T>;
  function useRef<T>(initialValue: T | null): RefObject<T>;
  function useRef<T = undefined>(): MutableRefObject<T | undefined>;
  function useMemo<T>(factory: () => T, deps: DependencyList): T;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T;

  // ---------- JSX ----------
  namespace JSX {
    interface Element extends ReactElement<any, any> {}
    interface ElementClass {}
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    type ElementType = string | JSXElementConstructor<any>;
    interface IntrinsicAttributes extends Attributes {}
    type LibraryManagedAttributes<C, P> = P;

    interface IntrinsicElements {
      a: AnchorHTMLAttributes<HTMLAnchorElement>;
      abbr: HTMLAttributes<HTMLElement>;
      article: HTMLAttributes<HTMLElement>;
      aside: HTMLAttributes<HTMLElement>;
      b: HTMLAttributes<HTMLElement>;
      blockquote: HTMLAttributes<HTMLQuoteElement>;
      br: HTMLAttributes<HTMLBRElement>;
      button: ButtonHTMLAttributes<HTMLButtonElement>;
      caption: HTMLAttributes<HTMLElement>;
      code: HTMLAttributes<HTMLElement>;
      div: HTMLAttributes<HTMLDivElement>;
      em: HTMLAttributes<HTMLElement>;
      fieldset: HTMLAttributes<HTMLFieldSetElement>;
      figcaption: HTMLAttributes<HTMLElement>;
      figure: HTMLAttributes<HTMLElement>;
      footer: HTMLAttributes<HTMLElement>;
      form: FormHTMLAttributes<HTMLFormElement>;
      h1: HTMLAttributes<HTMLHeadingElement>;
      h2: HTMLAttributes<HTMLHeadingElement>;
      h3: HTMLAttributes<HTMLHeadingElement>;
      h4: HTMLAttributes<HTMLHeadingElement>;
      h5: HTMLAttributes<HTMLHeadingElement>;
      h6: HTMLAttributes<HTMLHeadingElement>;
      header: HTMLAttributes<HTMLElement>;
      hr: HTMLAttributes<HTMLHRElement>;
      i: HTMLAttributes<HTMLElement>;
      img: ImgHTMLAttributes<HTMLImageElement>;
      input: InputHTMLAttributes<HTMLInputElement>;
      label: LabelHTMLAttributes<HTMLLabelElement>;
      legend: HTMLAttributes<HTMLLegendElement>;
      li: HTMLAttributes<HTMLLIElement>;
      main: HTMLAttributes<HTMLElement>;
      mark: HTMLAttributes<HTMLElement>;
      nav: HTMLAttributes<HTMLElement>;
      ol: OlHTMLAttributes<HTMLOListElement>;
      option: OptionHTMLAttributes<HTMLOptionElement>;
      p: HTMLAttributes<HTMLParagraphElement>;
      pre: HTMLAttributes<HTMLPreElement>;
      section: HTMLAttributes<HTMLElement>;
      select: SelectHTMLAttributes<HTMLSelectElement>;
      small: HTMLAttributes<HTMLElement>;
      span: HTMLAttributes<HTMLSpanElement>;
      strong: HTMLAttributes<HTMLElement>;
      sub: HTMLAttributes<HTMLElement>;
      sup: HTMLAttributes<HTMLElement>;
      table: HTMLAttributes<HTMLTableElement>;
      tbody: HTMLAttributes<HTMLTableSectionElement>;
      td: TdHTMLAttributes<HTMLTableCellElement>;
      textarea: TextareaHTMLAttributes<HTMLTextAreaElement>;
      tfoot: HTMLAttributes<HTMLTableSectionElement>;
      th: TdHTMLAttributes<HTMLTableCellElement>;
      thead: HTMLAttributes<HTMLTableSectionElement>;
      time: HTMLAttributes<HTMLTimeElement>;
      tr: HTMLAttributes<HTMLTableRowElement>;
      u: HTMLAttributes<HTMLElement>;
      ul: HTMLAttributes<HTMLUListElement>;
    }
  }
}

declare global {
  namespace JSX {
    interface Element extends React.JSX.Element {}
    interface ElementClass extends React.JSX.ElementClass {}
    interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute {}
    type ElementType = React.JSX.ElementType;
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}

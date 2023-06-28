import React, { MutableRefObject, ReactElement, useRef, useState } from "react";
import UIPage, { UIPageOptions } from "./page";
import { Button, Layout, Space, Typography } from "@arco-design/web-react";
import { IconMinus, IconPlus, IconProps } from "@arco-design/web-react/icon";
import Draggable from "react-draggable";
// @ts-ignore
import arcoCss from "./arco.css";
import CAT_UI from "./ui";
import {
  Outlet,
  RouteObject,
  RouterProvider,
  createMemoryRouter,
} from "react-router-dom";

export type UIPanelOptions = UIPageOptions & {
  min?: boolean;
  point?: {
    x: number;
    y: number;
  };
  header?: {
    title?: () => JSX.Element | JSX.Element | string;
    icon?: JSX.Element;
    style?: React.CSSProperties;
  };
  footer?: {
    version?: string;
  };
  routes?: RouteObject[];
  onReady?: (panel: UIPanel) => void;
};

// 创建UI面板
class UIPanel extends HTMLElement {
  options: UIPanelOptions;

  constructor() {
    super();
    // @ts-ignore
    this.options = UIPanel.options;
    this.defaultOptions();
    let oldRender = this.options.render;
    // const Child = (): ReactElement => {
    //   const ret = oldRender();
    //   if (ret instanceof Array) {
    //     return ret.map((val) => {
    //       return val;
    //     }) as unknown as ReactElement;
    //   }
    //   return ret as ReactElement;
    // };

    let Child: any = () => {
      return oldRender() as ReactElement;
    };

    const Render = () => {
      const ref = useRef<HTMLElement>();
      const [min, setMin] = useState(this.options.min ?? false);
      const title =
        typeof this.options.header?.title == "function"
          ? this.options.header?.title()
          : this.options.header?.title;

      return (
        <Draggable
          handle=".draggable"
          onStop={(e, d) => {
            this.draggableStopCallback &&
              this.draggableStopCallback({
                x: d.x,
                y: d.y,
              });
          }}
        >
          <Layout
            style={{
              position: "absolute",
              border: "1px solid var(--color-border-2)",
              background: "var(--color-bg-1)",
              top: "0px",
              left: "0px",
              borderRadius: "6px",
              zIndex: "1000",
              overflow: "hidden",
            }}
            ref={ref}
          >
            <UIPanel.DefaultHeader
              title={title}
              icon={this.options.header?.icon}
              style={this.options.header?.style}
              min={min}
              onMin={() => setMin(!min)}
              panel={ref}
            />
            {!min && (
              <Layout.Content
                style={{
                  padding: "4px 6px",
                }}
              >
                <Child />
              </Layout.Content>
            )}
            {!min && (
              <UIPanel.DefaultFooter version={this.options.footer?.version} />
            )}
          </Layout>
        </Draggable>
      );
    };

    if (this.options.routes) {
      Child = () => {
        return <Outlet />;
      };
      const routes: RouteObject[] = [
        {
          path: "/",
          Component: Render,
          children: this.options.routes,
        },
      ];
      const router = createMemoryRouter(routes);
      this.options.render = () => {
        return <RouterProvider router={router}></RouterProvider>;
      };
    } else {
      this.options.render = Render;
    }

    UIPage.render(this);
    this.options.onReady && this.options.onReady(this);
  }

  draggableStopCallback?: (event: { x: number; y: number }) => void;

  onDraggableStop(callback: (event: { x: number; y: number }) => void) {
    this.draggableStopCallback = callback;
  }

  protected defaultOptions() {
    if (!this.options.style) {
      this.options.style = arcoCss as unknown as string;
      this.options.style += `
        .flex{
          display: flex;
          flex: 1;
        }
        
        .justify-between{
          justify-content: space-between;
        }

        .min-btn:hover{
          color: var(--color-primary-5);
          background: var(--color-bg-2);
        }
      `;
    }
    if (this.options.appendStyle) {
      this.options.style += this.options.appendStyle;
    }
    if (!this.options.header) {
      this.options.header = {};
    }
    if (!this.options.footer) {
      this.options.footer = {};
    }
  }

  static DefaultHeader(props: {
    title?: JSX.Element | string;
    icon?: JSX.Element;
    style?: React.CSSProperties;
    min: boolean;
    panel: MutableRefObject<HTMLElement | undefined>;
    onMin?: () => void;
  }) {
    return (
      <Layout.Header
        className="flex"
        style={{
          alignItems: "center",
          padding: "4px 6px",
          ...props.style,
        }}
      >
        <div
          className="draggable flex"
          style={{
            flex: 1,
            cursor: "move",
            alignItems: "center",
            userSelect: "none",
            MozUserSelect: "-moz-none",
          }}
        >
          {props.icon}
          {props.title}
        </div>
        <Button
          type="text"
          className="min-btn"
          icon={props.min ? <IconPlus /> : <IconMinus />}
          iconOnly
          size="small"
          onClick={() => {
            props.onMin && props.onMin();
          }}
        />
      </Layout.Header>
    );
  }

  static DefaultFooter(props: { version?: string }) {
    return (
      <Layout.Footer
        className="flex"
        style={{
          alignItems: "center",
          padding: "4px 6px",
        }}
      >
        <div className="flex">{props.version && props.version}</div>
      </Layout.Footer>
    );
  }
}

export default UIPanel;

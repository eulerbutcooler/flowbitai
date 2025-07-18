/// <reference types="react" />
/// <reference types="react-dom" />

declare module "supportApp/SupportTicketsApp" {
  import { ComponentType } from "react";
  const SupportTicketsApp: ComponentType;
  export default SupportTicketsApp;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

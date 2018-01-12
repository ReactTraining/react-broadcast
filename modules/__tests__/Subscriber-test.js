import React from "react";
import ReactDOMServer from "react-dom/server";
import Subscriber from "../Subscriber";

describe("A <Subscriber>", () => {
  it("throws an invariant when it is not rendered in the context of a <Broadcast>", () => {
    expect(() => {
      ReactDOMServer.renderToStaticMarkup(<Subscriber channel="cupcakes" />);
    }).toThrow();
  });

  describe("with quiet=true", () => {
    it("does not throw when it is not rendered in the context of a <Broadcast>", () => {
      expect(() => {
        ReactDOMServer.renderToStaticMarkup(
          <Subscriber quiet channel="cupcakes" />
        );
      }).not.toThrow();
    });
  });
});

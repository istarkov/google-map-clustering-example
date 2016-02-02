import React, { Component } from 'react';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import layoutStyles from './Layout.sass';
import GMap from './GMap';
// for hmr to work I need the first class to extend Component
export class Layout extends Component {
  render() {
    const { styles: { layout, header, main, footer, logo } } = this.props;
    return (
      <div className={layout}>
        <header className={header}>
          <div>Clustering example google-map-react</div>
          <div><a href="github.com">github.com</a></div>
        </header>
        <main className={main}>
          <GMap />
        </main>
        <footer className={footer}>
          <div>Ivan Starkov</div>
          <div className={logo}></div>
          <div>@icelabaratory</div>
        </footer>
      </div>
    );
  }
}

export const layoutHOC = compose(
  defaultProps({
    styles: layoutStyles,
  })
);

export default layoutHOC(Layout);

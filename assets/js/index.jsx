import React from 'react';
import ReactDOM from 'react-dom';
import WidgetTable from './WidgetTable.jsx';

const { render } = ReactDOM;

// class HelloWorld extends React.Component {
//   render() {
//     return (
//       <div>Hello World</div>
//     );
//   };
// }

render (
  <WidgetTable />, document.getElementById("react-container")
);
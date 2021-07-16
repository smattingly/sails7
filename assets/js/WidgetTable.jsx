import React from 'react';

export default class WidgetTable extends React.Component {
  render() {
    return (
      <div id="infinite-scroller" class="sticky-table-container">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th class="text-right">#</th>
              <th>Name</th>
              <th><i class="fa fa-edit" style={{fontWeight: 'bold', color: 'black'}}></i></th>
              <th><i class="fa fa-trash-o" style={{fontWeight: 'bold', color: 'black'}}></i></th>
            </tr>
          </thead>

          <tbody id="table-body"></tbody>
        </table>
        <div id="loading" class="mx-auto" style={{width: '150px'}}>
          <div class="spinner-border text-primary"></div>
        </div>
      </div>
    );
  };
}

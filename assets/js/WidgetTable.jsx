import React from 'react';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import { restfulDelete } from './_fetch';

export default class WidgetTable extends React.Component {
  constructor() {
    super();
    this.state = {
      fetchedCount: 0,
      notFetchedCount: 0,
      fetchSize: 20,
      apiPrefix: 'api/v1',
      modelUrl: '/widget',
      fields: [{ attr: "id", align: "end" }, { attr: "name", align: "start" }],
      rows: []
    };

    this.canFetchOnScroll = true;
  }

  render() {
    return (
      <>
        <div id="spinner" className="mx-auto" style={{ width: '150px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
        <div id="infinite-scroller" class="sticky-table-container" onScroll={this.onScroll}>
          <Table id="data-table" table striped bordered>
            <thead>
              <tr id="heading-row">
                <th class="text-end">#</th>
                <th>Name</th>
                <th><i className="fa fa-edit" style={{ fontWeight: 'bold', color: 'black' }}></i></th>
                <th><i className="fa fa-trash-o" style={{ fontWeight: 'bold', color: 'black' }}></i></th>
              </tr>
            </thead>

            <tbody>
              {
                this.state.rows.map((row, rowIndex) => {
                  return (
                    <tr>
                      {
                        this.state.fields.map(field => {
                          return (
                            <td className={`text-${field.align}`}>
                              {row[field.attr]}
                            </td>
                          );
                        })
                      }

                      <td>
                        <a href={`${this.state.modelUrl}/${row.id}/edit`}>
                          <i className="fa fa-edit" style={{ color: 'black', cursor: 'pointer' }} data-toggle="tooltip" data-placement="right" title="Edit this record"></i>
                        </a>
                      </td>

                      <td>
                        <i className="fa fa-trash-o" onClick={() => this.deleteRow(rowIndex, row.id)} style={{ color: 'black', cursor: 'pointer' }} data-toggle="tooltip" data-placement="right" title="Delete this record"></i>
                      </td>
                    </tr>

                  );
                })
              }
              <tr id="filler" style={{ height: this.setFillerHeight() }}></tr>
            </tbody>
          </Table>
        </div>
      </>
    );
  }

  setFillerHeight() {
    const heading = document.getElementById('heading-row');
    if (!heading) return '0px';
    return `${heading.offsetHeight * this.state.notFetchedCount}px`;
  }

  componentDidMount() {
    this.fetchData().then(() => {
      document.getElementById('spinner').style.display = 'none';
    });
  }

  onScroll = () => {
    if (!this.canFetchOnScroll) return;

    /*

WHEN DRAG THUMB TO BOTTOM, NEED TO CATCH UP
- FETCH IN A LOOP?
- FETCH ONCE, THEN SCROLL TO MARKER?
- WAIT TO SEE IF SCROLLING ENDS?


    */

    const filler = document.getElementById('filler').getBoundingClientRect();
    if (filler.top - document.getElementById('infinite-scroller').getBoundingClientRect().bottom > 10) return;

    this.canFetchOnScroll = false;
    this.fetchData().then(() => {
      this.canFetchOnScroll = this.state.notFetchedCount > 0;
    });
  }

  async fetchData() {
    try {
      const response = await fetch(`${this.state.apiPrefix}${this.state.modelUrl}?skip=${this.state.fetchedCount}&limit=${this.state.fetchSize}`, {});

      if (!response.ok) {
        throw new Error(`An error occurred: ${response.status}`);
      }

      // HANDLE RANGE IN HTTP HEADERS
      let total = 100;

      const results = await response.json();
      this.setState((state) => {
        return {
          rows: state.rows.concat(results),
          fetchedCount: state.fetchedCount + results.length,
          notFetchedCount: total - (state.fetchedCount + results.length),
        };
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  deleteRow = (rowIndex, recordId) => {
    this.setState((state) => {
      return {
        rows: state.rows.slice(0, rowIndex).concat(state.rows.slice(rowIndex + 1))
      };
    });

    restfulDelete(`${this.state.apiPrefix}/${this.state.modelUrl}/${recordId}`);
  };
}

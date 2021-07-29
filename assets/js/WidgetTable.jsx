import React from 'react';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import { restfulDelete } from './_fetch';

export default class WidgetTable extends React.Component {
  constructor() {
    super();
    this.state = {
      fetchedCount: 0,
      notFetchedCount: 0, // approximate; records may be created/deleted between fetches
      moreToFetch: true,  // definitive
      fetchSize: 20,
      apiPrefix: 'api/v1',
      modelUrl: '/widget',
      fields: [{ attr: "id", align: "end" }, { attr: "name", align: "start" }],
      rows: []
    };

    this.okToFetch = true;
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
                <th>Actions</th>
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
                          <i className="fa fa-edit px-2" style={{ color: 'black', cursor: 'pointer' }} data-toggle="tooltip" data-placement="right" title="Edit this record"></i>
                        </a>

                        <i className="fa fa-trash-o px-2" onClick={() => this.deleteRow(rowIndex, row.id)} style={{ color: 'black', cursor: 'pointer' }} data-toggle="tooltip" data-placement="right" title="Delete this record"></i>
                      </td>
                    </tr>

                  );
                })
              }
            </tbody>
          </Table>
          <div id="filler" style={{ height: this.setFillerHeight() }}></div>
        </div>
      </>
    );
  }

  setFillerHeight() {
    // A "filler" is sized to keep scroll thumb proportional to total data.
    const heading = document.getElementById('heading-row');
    if (!heading) return '0px';
    return `${heading.offsetHeight * this.state.notFetchedCount}px`;
  }

  componentDidMount() {
    // Fetch first part of data, then hide spinner.
    this.fetchData().then(() => {
      document.getElementById('spinner').style.display = 'none';
    });
  }

  onScroll = () => {
    // Do nothing if all data fetched, or fetch is in progress. 
    if (!this.okToFetch) return;

    // Have we scrolled far enough down to need another data fetch?
    const filler = document.getElementById('filler');
    const scroller = document.getElementById('infinite-scroller');
    if (filler.getBoundingClientRect().top - scroller.getBoundingClientRect().bottom > 10) return;

    // Yes, so perform fetch.
    this.okToFetch = false;
    this.fetchData().then(() => {
      scroller.scrollBy(0, -1); // force scroll thumb to update
      this.okToFetch = this.state.moreToFetch;
    });
  }

  async fetchData() {
    try {
      // Request one "extra" record to see if there will still be more to fetch.
      const response = await fetch(`${this.state.apiPrefix}${this.state.modelUrl}?skip=${this.state.fetchedCount}&limit=${this.state.fetchSize + 1}`, {});

      if (!response.ok) {
        throw new Error(`An error occurred: ${response.status}`);
      }

      const range = response.headers.get('Content-Range') || '';
      const total = Number(range.substring(range.lastIndexOf('/') + 1));

      const results = await response.json();
      const moreToFetch = (results.length === this.state.fetchSize + 1);
      if (moreToFetch) results.pop(); // Drop the "extra" record.

      this.setState((state) => {
        return {
          rows: state.rows.concat(results),
          fetchedCount: state.fetchedCount + results.length,
          notFetchedCount: total - (state.fetchedCount + results.length),
          moreToFetch: moreToFetch
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

import React from 'react';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import { restfulDelete } from './_fetch';

export default class WidgetTable extends React.Component {
  constructor() {
    super();
    this.state = {
      skip: 0,
      limit: 9,
      moreToFetch: true,
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
              <tr>
                <th class="text-end">#</th>
                <th>Name</th>
                <th><i className="fa fa-edit" style={{ fontWeight: 'bold', color: 'black' }}></i></th>
                <th><i className="fa fa-trash-o" style={{ fontWeight: 'bold', color: 'black' }}></i></th>
              </tr>
            </thead>

            <tbody id="table-body">
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
              
            </tbody>
          </Table>
        </div>
      </>
    );
  }

  componentDidMount() {
    this.fetchData();
  }

  onScroll = async (event) => {
    if (!this.canFetchOnScroll) return; 

    console.log("onScroll")
    let scroller = event.target;
    const { scrollTop, scrollHeight, clientHeight } = scroller;

    const bounding = document.getElementById('data-table').lastElementChild.getBoundingClientRect();
let shouldFetch;
    if (
      // bounding.top >= 0 &&
      // bounding.left >= 0 &&
      // bounding.right <= (window.innerWidth || document.documentElement.clientWidth) &&
      // bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      bounding.top <= scroller.getBoundingClientRect().bottom 
    ) {
      shouldFetch = true;
      console.log(`fetching cause ${bounding.top} <= ${scroller.getBoundingClientRect().bottom}`)
    } else {
      shouldFetch = false;
      console.log('Not in the viewport... whomp whomp');
    }


    // if (scrollTop + clientHeight >= scrollHeight - 5) {
    if (shouldFetch) {

      // scroller.removeEventListener("scroll", this.onScroll);
    // console.log('disabled onScroll')
      this.setState((state) => {
        return { skip: state.skip + state.limit }
      });
      await this.fetchData(this.state.skip, this.state.limit);
      // if (this.state.moreToFetch) setTimeout(this.activateScrollHandler, 100);
    }
  }

  async fetchData() {
    if (!this.canFetchOnScroll) console.log('wtf?');
    this.canFetchOnScroll = false;
    setTimeout(async () => {
      try {
        const response = await fetch(`${this.state.apiPrefix}${this.state.modelUrl}?skip=${this.state.skip}&limit=${this.state.limit}`, {});

        if (!response.ok) {
          throw new Error(`An error occurred: ${response.status}`);
        }

        const results = await response.json();
        this.setState((state) => {
          const displayRows = state.rows.length + results.length;
          document.getElementById('data-table').style['padding-bottom'] = Math.max(60, (10 - displayRows) * 10) + '%';
          console.log(`padding now ${Math.max(60, (10 - displayRows) * 10)}%`)
          return {
            rows: state.rows.concat(results),
            moreToFetch: results.length === state.limit
          };
        });

        document.getElementById('spinner').style.display = 'none';
      } catch (error) {
        console.log(error.message);
      } finally {
        this.canFetchOnScroll = this.state.moreToFetch;
      }
    }, 500);
  }

  deleteRow = (rowIndex, recordId) => {
    this.setState((state) => {
      return {
        rows: state.rows.slice(0, rowIndex).concat(state.rows.slice(rowIndex + 1))
      };
    });
    restfulDelete(`${this.state.apiPrefix}/${this.state.modelUrl}/${recordId}`);
  };

  // activateScrollHandler = () => {
  //   console.log('activate onScroll')
  //   let scroller = document.getElementById('infinite-scroller');
  //   scroller.addEventListener("scroll", this.onScroll, {
  //     passive: true,
  //   })
  // };
}

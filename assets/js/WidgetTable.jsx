import React from 'react';
import Table from 'react-bootstrap/Table';

export default class WidgetTable extends React.Component {
  constructor() {
    super();
    this.state = {
      skip: 0,
      limit: 10,
      moreToFetch: true,
      apiPrefix: 'api/v1',
      modelUrl: '/widget',
      fields: [{ attr: "id", align: "right" }, { attr: "name", align: "left" }],
      rows: []
    };
    this.onScroll = this.onScroll.bind(this);
  }

  render() {
    return (
      <div id="infinite-scroller" class="sticky-table-container" onScroll={this.onScroll}>
        <Table table striped bordered>
          <thead>
            <tr>
              <th class="text-right">#</th>
              <th>Name</th>
              <th><i className="fa fa-edit" style={{ fontWeight: 'bold', color: 'black' }}></i></th>
              <th><i className="fa fa-trash-o" style={{ fontWeight: 'bold', color: 'black' }}></i></th>
            </tr>
          </thead>

          <tbody id="table-body">
            {
              this.state.rows.map((row, rowIndex) => {
                console.log(`rendering row ${rowIndex}`)
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
                      <i className="fa fa-trash-o" id={rowIndex} onClick={this.deleteRow} style={{ color: 'black', cursor: 'pointer' }} data-toggle="tooltip" data-placement="right" title="Delete this record"></i>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </Table>
      </div>
    );
  }

  componentDidMount() {
    this.fetchData();
  }

  async onScroll(event) {
    let scroller = event.target;
    const { scrollTop, scrollHeight, clientHeight } = scroller;

    if (scrollTop + clientHeight >= scrollHeight - 5) {
      // scroller.removeEventListener("scroll", onScroll);
      this.setState({
        skip: this.state.skip + this.state.limit
      });
      await this.fetchData(this.state.skip, this.state.limit);
      // if (this.state.moreToFetch) setTimeout(activateScrollHandler, 100);
    }
  }

  async fetchData() {
    setTimeout(async () => {
      try {
        const response = await fetch(`${this.state.apiPrefix}${this.state.modelUrl}?skip=${this.state.skip}&limit=${this.state.limit}`, {});

        if (!response.ok) {
          throw new Error(`An error occurred: ${response.status}`);
        }

        const results = await response.json();
        this.setState({
          rows: this.state.rows.concat(results),
          moreToFetch: results.length === this.state.limit
        });

        // spinner.style.display = "none";
      } catch (error) {
        console.log(error.message);
      }
    }, 500);
  }

  deleteRow = (event) => {
    const rowIndex = event.target.id;
    // const row = document.getElementById(id);
    // if (row) row.remove();
    this.setState({
      rows: this.state.rows.slice(0, rowIndex).concat(this.state.rows.slice(rowIndex + 1))
    });
    // restDelete(id);
  };
  // const activateScrollHandler = () => {
  //   scroller.addEventListener("scroll", onScroll, {
  //     passive: true,
  //   })
  // };
}

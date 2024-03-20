import React, { Component } from "react";
import settings from "../../settings";
import "./Search.scss";
class Pagination extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalPages: Math.ceil(
        this.props.itemsCount / settings.actualItemsPerPage
      ),
      selectedPage: props.selectedPage ? parseInt(props.selectedPage) : 1,
    };
  }

  onPageClick(page) {
    this.setState({ selectedPage: page });
    this.props.onPageChange(page);
  }

  renderPages = () => {
    let table = [];
    for (let i = 0; i < this.state.totalPages; i++) {
      const page = i + 1;
      table.push(
        <li
          key={page}
          onClick={this.onPageClick.bind(this, page)}
          className={this.state.selectedPage === page ? "selected" : ""}
        >
          {page}
        </li>
      );
    }
    return table;
  };

  render() {
    return <ul className="pagination">{this.renderPages()}</ul>;
  }
}

export default Pagination;

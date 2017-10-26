// @flow
import React from 'react';
import { Menu, Dropdown } from 'semantic-ui-react';
import _ from 'lodash';

type Props = {
  meta: Object,
  relay: Object,
};
type State = {
  page: number,
  per: number,
};

class PaginationMenu extends React.Component<Props, State> {
  state = {
    page: 1,
    per: 5,
  };

  onItemsPerPageSelection = (per: number) => {
    const newState = { page: 1, per };
    this.onRefetch(newState);
    this.setState(newState);
  };

  onPageSelection = (page: number) => {
    const newState = { ...this.state, page };
    this.onRefetch(newState);
    this.setState(newState);
  };

  onRefetch = (newState: { per: number, page: number }) => {
    const { relay } = this.props;
    relay.refetch(newState, null, error => {
      if (error) {
        console.error(error);
      }
    });
  };


  refetch = () => {
    this.onRefetch(this.state);
  };

  render() {
    const { meta } = this.props;
    return (
      <Menu pagination>
        {_.times(meta.totalPages, n => {
          const page = n + 1;
          return (
            <Menu.Item
              key={`pagination-${page}`}
              name={String(page)}
              active={page === meta.currentPage}
              onClick={() => this.onPageSelection(page)}
            />
          );
        })}
        <Dropdown item text="Per page">
          <Dropdown.Menu>
            {_.map([5, 10, 20, 50, 100], count => (
              <Dropdown.Item
                key={`items-per-page-${count}`}
                onClick={() => this.onItemsPerPageSelection(count)}
              >
                {count}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Menu>
    );
  }
}

export default PaginationMenu;

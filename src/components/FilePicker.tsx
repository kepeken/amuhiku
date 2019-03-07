import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Page from './Page';
import * as List from './List';
import * as API from '../api/base';

interface Props {
  initialPage: typeof Page.Item;
  onSelect: (content: string) => void;
}

interface State {
  pages: {
    title: string;
    items: (API.File | API.Folder)[];
  }[];
  loading: boolean;
}

export default class FilePicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { pages: [], loading: false };
    this.handlePop = this.handlePop.bind(this);
  }

  handlePop() {
    this.setState({ pages: this.state.pages.slice(0, -1) })
  }

  async handleList(folder: API.Folder) {
    this.setState({ loading: true });
    const entries = await folder.list();
    this.setState({
      pages: [
        ...this.state.pages,
        {
          title: folder.name,
          items: entries,
        },
      ],
      loading: false,
    });
  }

  async handleSelect(file: API.File) {
    this.setState({ loading: true });
    const content = await file.read();
    this.setState({ loading: false });
    this.props.onSelect(content);
  }

  render() {
    return (
      <Page.List>
        {this.props.initialPage}
        {this.state.pages.map(({ title, items }, idx) =>
          <Page.Item key={idx}>
            <Page.Header>
              <Page.Button onClick={this.handlePop}>
                <FontAwesomeIcon icon="chevron-left" />
              </Page.Button>
              <Page.Title>{title}</Page.Title>
            </Page.Header>
            <Page.Body>
              <List.List>
                {items.map((entry, idx) =>
                  entry instanceof API.Folder
                    ?
                    <List.Item key={idx} onClick={() => this.handleList(entry)}>
                      <List.Icon><FontAwesomeIcon icon="folder" /></List.Icon>
                      <List.Text>{entry.name}</List.Text>
                    </List.Item>
                    :
                    <List.Item key={idx} onClick={() => this.handleSelect(entry)}>
                      <List.Icon><FontAwesomeIcon icon="file" /></List.Icon>
                      <List.Text>{entry.name}</List.Text>
                    </List.Item>
                )}
              </List.List>
            </Page.Body>
          </Page.Item>
        )}
      </Page.List>
    )
  }
}

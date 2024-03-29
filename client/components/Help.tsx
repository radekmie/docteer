import { Component, h } from 'preact';

type Help$Props = {
  active: boolean;
};

const actions = [
  ['?', 'Show help'],
  ['↑', 'Previous note'],
  ['↓', 'Next note'],
  ['←', 'Previous filter'],
  ['→', 'Next filter'],
  ['Enter', 'Toggle note/filter'],
].map(action => (
  <div className="flex flex-between" key={action[0]}>
    <b>
      <code>{action[0]}</code>
    </b>
    <i>{action[1]}</i>
  </div>
));

export class Help extends Component<Help$Props> {
  shouldComponentUpdate(props: Help$Props) {
    return this.props.active !== props.active;
  }

  render(props: Help$Props) {
    return (
      <div
        className={`bg-dark-gray center fixed${
          props.active ? '' : ' hidden'
        } near-white pa3 w5`}
      >
        <div className="flex flex-between flex-end">
          <b>Keyboard Shortcuts</b>
          <small>ESC to close</small>
        </div>
        <hr />
        {actions}
      </div>
    );
  }
}
